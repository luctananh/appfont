import { Banner } from '@shopify/polaris';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    LegacyCard,
    Tabs,
    Button,
    Checkbox,
    TextField,
    DropZone,
    LegacyStack,
    Thumbnail,
    Layout,
    Page,
    Select,
    Card,
    Toast,
    Frame,
    Modal,
    Text,
    ButtonGroup,
} from '@shopify/polaris';
import { NoteIcon } from '@shopify/polaris-icons';
import { api } from '../api'; // Import các hàm API tùy chỉnh
import { useNavigate } from 'react-router'; // Import hook để điều hướng trang
import { debounce } from 'lodash'; // Import hàm debounce để giới hạn tần suất gọi hàm

// Các hằng số
const FONT_PER_PAGE = 20; // Số lượng font hiển thị trên mỗi trang trong tab Google Fonts
const COLUMNS = 2; // Số cột để hiển thị font trong modal

// Component chính
export default function FontManager() {
    // Khởi tạo hook điều hướng
    const navigate = useNavigate();

    // Các biến trạng thái (state) để quản lý UI và dữ liệu
    const [selected, setSelected] = useState(0); // Index của tab đang được chọn (0: Upload Font, 1: Google Fonts)
    const [fileName, setFileName] = useState(''); // Tên của file font đã upload
    const [file, setFile] = useState(null); // Lưu trữ 1 file duy nhất
    const [selectedElements, setSelectedElements] = useState({
        // Object để theo dõi các element HTML được chọn để áp dụng font
        h1: false,
        h2: false,
        h3: false,
        h4: false,
        h5: false,
        h6: false,
        body: false,
        p: false,
        a: false,
        li: false,
    });
    const [allElementsSelected, setAllElementsSelected] = useState(false); // Theo dõi nếu checkbox "Chọn tất cả" được chọn hay không
    const [fonts, setFonts] = useState([]); // Mảng lưu trữ tất cả các font đã lấy về (hiện tại không dùng trong code)
    const [googleFonts, setGoogleFonts] = useState([]); // Mảng lưu trữ các font Google đã lấy về
    const [selectedFont, setSelectedFont] = useState(null); // Font đang được chọn (cho tab Google Fonts)
    const [fontDetails, setFontDetails] = useState(null); // Chi tiết của font đang được chọn
    const [showModal, setShowModal] = useState(false); // Kiểm soát hiển thị của modal chọn font
    const [loading, setLoading] = useState(false); // Kiểm soát trạng thái loading cho UI
    const [toastActive, setToastActive] = useState(false); // Kiểm soát hiển thị của thông báo toast
    const [toastContent, setToastContent] = useState(''); // Nội dung của thông báo toast
    const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm để lọc font Google
    const [fontsSelected, setFontsSelected] = useState({}); // Theo dõi các font được chọn trong modal (hỗ trợ chọn nhiều)
    const [fontNamesSelected, setFontNamesSelected] = useState(''); // Chuỗi hiển thị tên các font đã chọn từ modal Google Fonts
    const [loadedFonts, setLoadedFonts] = useState([]); // Theo dõi font nào đã được load css, tránh load lại nhiều lần
    const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại của danh sách font Google
    const [bannerActive, setBannerActive] = useState(false); // Kiểm soát hiển thị banner
    const [bannerContent, setBannerContent] = useState(''); // Nội dung của banner
    // Hàm xử lý khi tab thay đổi
    const handleTabChange = useCallback((selectedTabIndex) => setSelected(selectedTabIndex), []);

    // Hàm lấy font google qua API
    const fetchGoogleFontsFromApi = async () => {
        try {
            const apiKey = "AIzaSyAgUcqZQ2hzVAmzfzKZOjeuF5hxfMaFKLQ"; // API key cho Google Fonts API
            const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`);
            if (!response.ok) {
                // Kiểm tra xem request API có thành công không
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); // Phân tích dữ liệu trả về dưới dạng JSON

            // Map dữ liệu API trả về thành một mảng các object font
            const googleFontsOptions = data.items.map((font) => ({
                label: font.family, // Tên font
                value: font.family, // Tên font (dùng làm giá trị cho select controls)
                variants: font.variants, // Các biến thể của font
                style: `@import url('https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}&display=swap');`, // CSS @import URL cho từng font
            }));
            setGoogleFonts(googleFontsOptions); // Cập nhật state với các font đã lấy
            // Load các font ban đầu và css
            loadFontsForPage(1, googleFontsOptions);
        } catch (error) {
            console.error('Error fetching Google Fonts API:', error);
            setToastContent('Error fetching Google Fonts: ' + error);
            setToastActive(true);
        }
    };
    // Hàm lấy font tùy chỉnh từ Gadget API
    const fetchFonts = async () => {
        try {
            const result = await api.datafontgg.findMany(); // Lấy tất cả các font tùy chỉnh
            console.log('Fetched fonts:', result);
            fetchGoogleFontsFromApi();
        } catch (error) {
            console.error('Error fetching fonts:', error);
            setToastContent('Error fetching fonts: ' + error);
            setToastActive(true);
        }
    };
    //Effect Hook để lấy font khi component được render lần đầu tiên
    useEffect(() => {
        fetchFonts();
    }, []);

    // Hàm upload file font tùy chỉnh lên Gadget API
    const uploadFileToGadget = async (file, keyfont) => {
        setLoading(true); // Set trạng thái loading
        try {
            const reader = new FileReader(); // FileReader để xử lý nội dung file
            reader.readAsDataURL(file); // Đọc file dưới dạng base64
            reader.onloadend = async () => {
                // Event khi file đã đọc xong
                const base64Data = reader.result.split(',')[1]; // Lấy data base64
                try {
                    await api.datafontgg.create({
                            // Tạo font mới
                            name: fileName,
                            link: base64Data,
                        keyfont: keyfont,
                        });
                    fetchFonts(); // Tải lại danh sách font
                    await handleCreateUpdateSelectfont(keyfont); // Cập nhật cài đặt font đã chọn sau khi upload
                } catch (error) {
                    console.error('Error uploading/updating file to Gadget:', error);
                    setToastContent('Upload failed. Please try again: ' + error.message);
                    setToastActive(true);
                } finally {
                    setLoading(false); // Reset trạng thái loading
                }
            };

            reader.onerror = (error) => {
                // Event khi đọc file bị lỗi
                console.error('Error reading file:', error);
                setToastContent('Error reading file. Please try again.');
                setToastActive(true);
                setLoading(false);
            };
        } catch (error) {
            console.error('Error uploading file:', error);
            setToastContent('Upload failed. Please try again: ' + error.message);
            setToastActive(true);
            setLoading(false);
        }
    };
    // Hàm xử lý khi file được thả vào DropZone
        const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles) => {
        setFile(acceptedFiles[0]); // Chỉ lấy file đầu tiên
    }, []);

    // Hàm cập nhật tên file
    const handleNameChange = useCallback((newName) => setFileName(newName), []);

    // Hàm xử lý khi element checkbox thay đổi
    const handleElementChange = useCallback((element) => {
        setSelectedElements((prevState) => {
            const newState = { ...prevState, [element]: !prevState[element] }; // Toggle trạng thái chọn của checkbox
            setAllElementsSelected(Object.values(newState).every((v) => v)); // Cập nhật select all nếu tất cả checkbox khác được chọn/bỏ chọn
            return newState;
        });
    }, []);

    // Hàm xử lý khi checkbox tất cả các element thay đổi
    const handleAllElementsChange = useCallback(() => {
        setAllElementsSelected((prev) => {
            const newState = !prev; // Toggle trạng thái select all
            setSelectedElements({
                // Cập nhật trạng thái của tất cả các checkbox element khác
                h1: newState,
                h2: newState,
                h3: newState,
                h4: newState,
                h5: newState,
                h6: newState,
                body: newState,
                p: newState,
                a: newState,
                li: newState,
            });
            return newState;
        });
    }, []);

    // Hàm lưu font sau khi upload
     const handleSave = async () => {
        if (!file || !fileName) {
            // Validation: Check file và tên
            setBannerContent('Please add file and enter the name!');
            setBannerActive(true);
            return;
        }
        const selectedTags = Object.keys(selectedElements)
        .filter((key) => selectedElements[key])
        .join(',');
        if (!selectedTags) {
            setBannerContent('Please select the elements to apply the font!');
            setBannerActive(true);
            return;
        }
        try {
             setLoading(true);
              const reader = new FileReader(); // FileReader để xử lý nội dung file
            reader.readAsDataURL(file); // Đọc file dưới dạng base64
            reader.onloadend = async () => {
                  const base64Data = reader.result.split(',')[1]; // Lấy data base64
             
                      await api.datafontgg.create({
                            // Tạo font mới
                            name: fileName,
                            link: base64Data,
                            keyfont: "upload",
                         });
                     fetchFonts(); // Tải lại danh sách font
                     const latestFont = await api.datafontgg.findMany({
                         orderBy: {
                             createdAt: 'desc',
                         },
                        take: 1,
                         filter: {
                            keyfont: { equals: "upload" },
                         },
                    });
                    if (latestFont.length === 0) {
                      setToastContent('No fonts uploaded yet.');
                      setToastActive(true);
                        return;
                    }

                   const selectedFontDetail = latestFont[0]
                    const selectfontRecords = await api.selectfont.findMany({
                        filter: {
                             shopid: { equals: String(await api.shopifyShop.findFirst({ select: { id: true } }).id) },
                             namespace: { equals: 'setting' },
                             key: { equals: 'style' },
                        },
                    });

                     let data;
                     const value = {
                         id: selectedFontDetail.id,
                         name: selectedFontDetail.name,
                         link: selectedFontDetail.link,
                         selectedElements: selectedTags,
                    };
                    if (selectfontRecords.length === 0) {
                      data = await api.selectfont.create({
                           selectfont: {
                            shopid: String(await api.shopifyShop.findFirst({ select: { id: true } }).id),
                             namespace: 'setting',
                              key: 'style',
                             value: value,
                          },
                        });
                     } else {
                       data = await api.selectfont.update(selectfontRecords[0].id, {
                         selectfont: {
                            value: value,
                            },
                         });
                     }
                    if (value && value.selectedElements) {
                       const selectedTags = value.selectedElements.split(',');
                       const initialSelectedElements = {
                           h1: false,
                           h2: false,
                           h3: false,
                           h4: false,
                           h5: false,
                           h6: false,
                           body: false,
                           p: false,
                           a: false,
                           li: false,
                        };
                         selectedTags.forEach((tag) => {
                           if (initialSelectedElements.hasOwnProperty(tag)) {
                               initialSelectedElements[tag] = true;
                            }
                         });
                         setSelectedElements(initialSelectedElements);
                     } else {
                        setSelectedElements({
                            h1: false,
                            h2: false,
                           h3: false,
                            h4: false,
                            h5: false,
                           h6: false,
                           body: false,
                           p: false,
                            a: false,
                            li: false,
                        });
                    }
                 
                    setToastContent('Font applied successfully!');
                    setToastActive(true);
            }
              reader.onerror = (error) => {
                // Event khi đọc file bị lỗi
                console.error('Error reading file:', error);
                setToastContent('Error reading file. Please try again.');
                setToastActive(true);
                setLoading(false);
            };
            // Reset file và tên sau khi lưu thành công
             setFile(null) // Reset state file
            setFileName(''); // Reset state tên file
        } catch (error) {
            console.error('Error saving font:', error);
            setToastContent('Failed to save font: ' + error);
            setToastActive(true);
        }finally{
             setLoading(false);
        }
    };

    // Hàm tạo/cập nhật cài đặt font đã chọn và lưu vào Gadget API
    const handleCreateUpdateSelectfont = async (keyfont, selectedFonts) => {
        try {
            setLoading(true);
            const shop = await api.shopifyShop.findFirst({ select: { id: true } });
            if (!shop || !shop.id) {
                throw new Error('Could not fetch Shop ID');
            }
            const shopid = String(shop.id);
            let selectedFontDetail;
             if (keyfont === 'google') {
                if (!selectedFonts) {
                    setBannerContent('Please select a font first.');
                    setBannerActive(true);
                    setLoading(false);
                    return;
                }
                const fontNamesArray = selectedFonts.split(',');
                const fontDetails = googleFonts.filter((font) => fontNamesArray.includes(font.value));
                if (!fontDetails || fontDetails.length === 0) {
                    setBannerContent('Please select a font first.');
                    setBannerActive(true);
                    setLoading(false);
                    return;
                }
                selectedFontDetail = {
                    id: fontDetails[0].value,
                    name: fontDetails[0].label,
                    link: `https://fonts.googleapis.com/css2?family=${fontDetails[0].label.replace(/ /g, '+')}&display=swap`,
                    keyfont: keyfont,
                };
                 await api.datafontgg.create({
                     name: selectedFontDetail.name,
                     link: selectedFontDetail.link,
                     keyfont: 'google',
                 });
                  fetchFonts() // Tải lại danh sách font
            } else {
                 const latestFont = await api.datafontgg.findMany({
                     orderBy: {
                        createdAt: 'desc',
                    },
                     take: 1,
                     filter: {
                         keyfont: { equals: "upload" },
                     },
                });
                 if (latestFont.length === 0) {
                     setToastContent('No fonts uploaded yet.');
                    setToastActive(true);
                   return;
                 }
                  selectedFontDetail = latestFont[0];
            }
            const selectedTags = Object.keys(selectedElements)
                .filter((key) => selectedElements[key])
                .join(',');
            if (!selectedTags) {
                setBannerContent('Please select the elements to apply the font!');
                setBannerActive(true);
                setLoading(false);
                return;
            }

            const selectfontRecords = await api.selectfont.findMany({
                filter: {
                    shopid: { equals: shopid },
                    namespace: { equals: 'setting' },
                    key: { equals: 'style' },
                },
            });

            let data;
            const value = {
                id: selectedFontDetail.id,
                name: selectedFontDetail.name,
                link: selectedFontDetail.link,
                selectedElements: selectedTags,
            };
            if (selectfontRecords.length === 0) {
                data = await api.selectfont.create({
                    selectfont: {
                        shopid: shopid,
                        namespace: 'setting',
                        key: 'style',
                        value: value,
                    },
                });
            } else {
                data = await api.selectfont.update(selectfontRecords[0].id, {
                    selectfont: {
                        value: value,
                    },
                });
            }
            if (value && value.selectedElements) {
                const selectedTags = value.selectedElements.split(',');
                const initialSelectedElements = {
                    h1: false,
                    h2: false,
                    h3: false,
                    h4: false,
                    h5: false,
                    h6: false,
                    body: false,
                    p: false,
                    a: false,
                    li: false,
                };
                selectedTags.forEach((tag) => {
                    if (initialSelectedElements.hasOwnProperty(tag)) {
                        initialSelectedElements[tag] = true;
                    }
                });
                setSelectedElements(initialSelectedElements);
            } else {
                setSelectedElements({
                    h1: false,
                    h2: false,
                    h3: false,
                    h4: false,
                    h5: false,
                    h6: false,
                    body: false,
                    p: false,
                    a: false,
                    li: false,
                });
            }
            setFontDetails(selectedFontDetail);
            await api.update1();
            setToastContent('Font applied successfully!');
            setToastActive(true);
        } catch (error) {
            console.error('Error creating/updating selectfont:', error);
            setToastContent('Error saving selected font: ' + error.message);
            setToastActive(true);
        } finally {
            setLoading(false);
        }
    };
    // Hàm toggle trạng thái font được chọn
    const handleFontChange = (value) => {
        setFontsSelected((prevFonts) => {
            const newFonts = {}; // Tạo bản sao của state trước
            newFonts[value] = !prevFonts[value]; // Toggle giá trị của font đã chọn
            return newFonts;
        });
    };
    // Hàm xác nhận các font đã chọn từ modal
    const handleFontSelect = async () => {
        const selectedFonts = Object.keys(fontsSelected) // Lấy mảng các key font đã chọn
            .filter((key) => fontsSelected[key])
            .join(','); // Chuyển mảng thành chuỗi phân tách bằng dấu phẩy
        const selectedFontNames = Object.keys(fontsSelected) // Lấy mảng các tên font đã chọn
            .filter((key) => fontsSelected[key])
            .join(', '); // Chuyển mảng thành chuỗi phân tách bằng dấu phẩy

        setSelectedFont(selectedFonts); // Cập nhật state với các font đã chọn
        setFontNamesSelected(selectedFontNames); // Cập nhật state tên các font đã chọn
        setShowModal(false); // Đóng modal
        if (!selectedFonts) {
            setBannerContent('Please select at least one font.');
            setBannerActive(true);
            return;
        }
    };
    // Hàm xóa các file đã thả vào drop zone
     const handleClearDropZone = () => {
       setFile(null); // Reset file
        setFileName(''); // Reset state tên file
    };

    // Hàm debounce input tìm kiếm trong modal
    const handleSearchChange = useCallback(
        debounce((newSearch) => {
            setSearchQuery(newSearch); // Cập nhật state từ khóa tìm kiếm
            setCurrentPage(1); // Reset page về 1
        }, 300), // Độ trễ 300ms
        []
    );

    // Hàm mở modal chọn font
    const handleModalOpen = useCallback(() => {
        //reset searchQuery and fontsSelected
        setSearchQuery(''); // Xóa tìm kiếm
        setFontsSelected({}); // Reset các font đã chọn
        // Update fontsSelected with current selected font if it is available
        if (selectedFont) {
            const selectedFontArray = selectedFont.split(',');
            const newFontSelected = {};
            googleFonts.forEach((font) => {
                if (selectedFontArray.includes(font.value)) {
                    // Kiểm tra nếu font đang chọn có trong danh sách google font
                    newFontSelected[font.value] = true;
                }
            });
            setFontsSelected(newFontSelected);
        }
        setShowModal(true); // Hiển thị modal
    }, [selectedFont, googleFonts]);

    // Hàm đóng modal chọn font
    const handleModalClose = useCallback(() => {
        setShowModal(false); // Ẩn modal
    }, []);

    // Mảng các tab
    const tabs = [
        {
            id: 'upload-tab',
            content: 'Upload Font', // Label cho tab Upload Font
            panelID: 'upload-tab-content',
        },
        {
            id: 'google-font-tab',
            content: 'Google Fonts', // Label cho tab Google Fonts
            panelID: 'google-font-tab-content',
        },
    ];
    // Lọc font theo từ khóa tìm kiếm trong modal
    const filteredFonts = googleFonts.filter((font) => font.label.toLowerCase().includes(searchQuery.toLowerCase()));
    // Load font cho trang hiện tại
    const loadFontsForPage = (page, fonts = googleFonts) => {
        const start = (page - 1) * FONT_PER_PAGE; // Tính toán font bắt đầu của trang hiện tại
        const end = start + FONT_PER_PAGE; // Tính toán font kết thúc của trang hiện tại
        const fontsToLoad = fonts.slice(start, end); // Lấy các font cho trang hiện tại
        fontsToLoad.forEach((font) => {
            const style = document.createElement('style');
            style.textContent = font.style;
            if (!loadedFonts.includes(font.value)) {
                // Kiểm tra font đã được load chưa
                document.head.appendChild(style);
                setLoadedFonts((prevLoadedFonts) => [...prevLoadedFonts, font.value]);
            }
        });
    };
    // Hàm xử lý khi chuyển trang trong danh sách font modal
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage); // Cập nhật trang hiện tại
        loadFontsForPage(newPage); //Load font cho trang hiện tại
    };
    const totalPages = Math.ceil(filteredFonts.length / FONT_PER_PAGE); // Tính tổng số trang
    const paginatedFonts = filteredFonts.slice((currentPage - 1) * FONT_PER_PAGE, currentPage * FONT_PER_PAGE); // Lấy các font của trang hiện tại
    
    const fileUpload = !file && (
        <DropZone.FileUpload actionHint="Accepts .woff, .otf, and .ttf" />
    );
     const uploadedFile = file && (
        <LegacyStack>
            <Thumbnail
                size="small"
                alt={file.name}
                source={
                    validImageTypes.includes(file.type)
                        ? window.URL.createObjectURL(file)
                        : NoteIcon
                }
            />
            <div>
                {file.name}{' '}
                <Text variant="bodySm" as="p">
                    {file.size} bytes
                </Text>
            </div>
        </LegacyStack>
    );
    return (
        // Frame cho toàn bộ ứng dụng
        <Frame>
            <Page
                title="Fonts"
                backAction={{
                    content: 'Shop Information',
                    onAction: () => navigate('/'),
                }}
            >
                <Layout>
                    {bannerActive && (
                        <Layout.Section>
                            <Banner title="Error" onDismiss={() => setBannerActive(false)}>
                                <p>{bannerContent}</p>
                            </Banner>
                        </Layout.Section>
                    )}
                    <Layout.Section>
                        <LegacyCard>
                            <Tabs
                                tabs={tabs} // Mảng các tab
                                selected={selected} // Tab đang được chọn
                                onSelect={handleTabChange} // Callback khi chọn tab
                                fitted
                            >
                                <LegacyCard.Section
                                    title={
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {tabs[selected].content}
                                            {selected === 0 && <Button onClick={handleClearDropZone}>Clear</Button>}
                                        </div>
                                    }
                                >
                                    <div className="tab-content">
                                        {selected === 0 && (
                                            <>
                                                <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                                                        {uploadedFile}
                                                        {fileUpload}
                                                    </DropZone>
                                                <p>
                                                    1.Need more fonts? Let's buy the recommended font from NitroApps here:
                                                    <a
                                                        href="https://www.fontspring.com?refby=NitroApps"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        https://www.fontspring.com?refby=NitroApps
                                                    </a>
                                                </p>
                                                2.or free fonts here:
                                                <a href="https://fonts.adobe.com" target="_blank" rel="noopener noreferrer">
                                                    https://fonts.adobe.com
                                                </a>
                                                ,
                                                <a href="https://www.fonts.com" target="_blank" rel="noopener noreferrer">
                                                    https://www.fonts.com
                                                </a>
                                                ,
                                                <a
                                                    href="https://webfonts.ffonts.net"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    https://webfonts.ffonts.net
                                                </a>
                                                ,
                                                <a
                                                    href="https://fontsforweb.com"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    https://fontsforweb.com
                                                </a>
                                                <p>
                                                    3.Convert file to woff:
                                                    <a
                                                        href="https://cloudconvert.com/otf-to-ttf"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        https://cloudconvert.com/otf-to-ttf
                                                    </a>
                                                </p>
                                                <TextField
                                                    label="Font Name"
                                                    value={fileName}
                                                    onChange={handleNameChange}
                                                />
                                                <p>
                                                    The font name should be unique and simple text, no special
                                                    characters.
                                                </p>
                                            </>
                                        )}
                                        {selected === 1 && (
                                            <div>
                                                <TextField
                                                    value={fontNamesSelected || ''}
                                                    onClick={handleModalOpen}
                                                />
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginTop: '5px',
                                                    }}
                                                >
                                                    <div style={{ flex: 1 }}></div>
                                                    <Button onClick={handleModalOpen}>Choose font</Button>
                                                </div>
                                                <Modal open={showModal} onClose={handleModalClose} title="Select a font">
                                                    <Modal.Section>
                                                        <TextField
                                                            label="Search by font name"
                                                            value={searchQuery}
                                                            onChange={handleSearchChange}
                                                        />
                                                        <div
                                                            style={{
                                                                display: 'grid',
                                                                gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
                                                                gap: '10px',
                                                            }}
                                                        >
                                                            {paginatedFonts.map((font) => (
                                                                <div key={font.value} style={{ padding: '5px' }}>
                                                                    <Checkbox
                                                                        label={
                                                                            <span style={{ fontFamily: font.label }}>
                                                                                {font.label}
                                                                            </span>
                                                                        }
                                                                        checked={!!fontsSelected[font.value]}
                                                                        onChange={() => handleFontChange(font.value)}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        {totalPages > 1 && (
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    margin: '10px 0',
                                                                }}
                                                            >
                                                                <ButtonGroup>
                                                                    <Button
                                                                        disabled={currentPage === 1}
                                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                                    >
                                                                        Previous
                                                                    </Button>
                                                                    <Text variant="bodySm" as="span" fontWeight="bold">
                                                                        {currentPage}/{totalPages}
                                                                    </Text>
                                                                    <Button
                                                                        disabled={currentPage === totalPages}
                                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                                    >
                                                                        Next
                                                                    </Button>
                                                                </ButtonGroup>
                                                            </div>
                                                        )}
                                                        <ButtonGroup>
                                                            <Button primary onClick={handleModalClose}>
                                                                Cancel
                                                            </Button>
                                                            <Button primary onClick={handleFontSelect}>
                                                                Confirm
                                                            </Button>
                                                        </ButtonGroup>
                                                    </Modal.Section>
                                                </Modal>
                                            </div>
                                        )}
                                    </div>
                                </LegacyCard.Section>
                            </Tabs>
                        </LegacyCard>
                    </Layout.Section>

                    <Layout.Section>
                        <Card title="Select Elements to Apply Font">
                            <p>Assign font to elements</p>
                            <p>Select elements to assign font to:</p>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <Checkbox
                                    label="All"
                                    checked={allElementsSelected}
                                    onChange={handleAllElementsChange}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="Headline 1 (h1 tags)"
                                    checked={selectedElements.h1}
                                    onChange={() => handleElementChange('h1')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="Headline 2 (h2 tags)"
                                    checked={selectedElements.h2}
                                    onChange={() => handleElementChange('h2')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="Headline 3 (h3 tags)"
                                    checked={selectedElements.h3}
                                    onChange={() => handleElementChange('h3')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="Headline 4 (h4 tags)"
                                    checked={selectedElements.h4}
                                    onChange={() => handleElementChange('h4')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="Headline 5 (h5 tags)"
                                    checked={selectedElements.h5}
                                    onChange={() => handleElementChange('h5')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="Headline 6 (h6 tags)"
                                    checked={selectedElements.h6}
                                    onChange={() => handleElementChange('h6')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="body (body tags)"
                                    checked={selectedElements.body}
                                    onChange={() => handleElementChange('body')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="Paragraph (p tags)"
                                    checked={selectedElements.p}
                                    onChange={() => handleElementChange('p')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="Anchor link (a tags)"
                                    checked={selectedElements.a}
                                    onChange={() => handleElementChange('a')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                                <Checkbox
                                    label="List (li tags)"
                                    checked={selectedElements.li}
                                    onChange={() => handleElementChange('li')}
                                    style={{ marginBottom: '5px', display: 'block' }}
                                />
                            </div>
                        </Card>
                    </Layout.Section>

                    <Layout.Section>
                        <Card title="Save">
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ flex: 1 }}></div>
                                <Button
                                    onClick={
                                        selected === 0
                                            ? handleSave
                                            : () => handleCreateUpdateSelectfont('google', selectedFont)
                                    }
                                    primary
                                    loading={loading}
                                    variant="primary"
                                >
                                    Save
                                </Button>
                            </div>
                        </Card>
                    </Layout.Section>

                    {toastActive && (
                        <Toast content={toastContent} onDismiss={() => setToastActive(false)} />
                    )}
                </Layout>
            </Page>
        </Frame>
    );
}