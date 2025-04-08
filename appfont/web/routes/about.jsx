import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
    Tabs,
    Button,
    Checkbox,
    TextField,
    Thumbnail,
    Layout,
    Page,
    Card,
    Toast,
    Modal,
    Text,
    ButtonGroup,
    MediaCard,
    VideoThumbnail,
    Banner,
    BlockStack,
    Grid,
    AppProvider,
    Frame,
    DropZone,
    InlineError,
    Spinner
} from '@shopify/polaris';
import { NoteIcon, XIcon, } from '@shopify/polaris-icons';
import { api } from '../api';
import { debounce } from 'lodash';

const FONT_PER_PAGE = 15;
const COLUMNS = 3;

export default function FontManager() {
    // const [showModal, setShowModal] = useState(false);
    const location = useLocation();
    const setFontDataFromAppPage = location.state?.setFontDataProp;
    const isEditMode = new URLSearchParams(location.search).get('edit') === 'true';
    const fontIdFromUrl = new URLSearchParams(location.search).get('fontId');
    const [fontToDeleteId, setFontToDeleteId] = useState(fontIdFromUrl);
    const [selected, setSelected] = useState(0);
    const [fileName, setFileName] = useState('');
    const [file, setFile] = useState(null);
    const [allElementsSelected, setAllElementsSelected] = useState(false);
    const [googleFonts, setGoogleFonts] = useState([]);
    const [selectedFont, setSelectedFont] = useState(null);
    const [fontDetails, setFontDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toastActive, setToastActive] = useState(false);
    const [toastContent, setToastContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [fontsSelected, setFontsSelected] = useState({});
    const [fontNamesSelected, setFontNamesSelected] = useState('');
    const [loadedFonts, setLoadedFonts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [bannerActive, setBannerActive] = useState(false);
    const [bannerContent, setBannerContent] = useState('');
    const [fileError, setFileError] = useState(true); // Ban đầu hiển thị lỗi Add file
    const [nameError, setNameError] = useState(true); // Ban đầu hiển thị lỗi Name file
    const [elementsError, setElementsError] = useState(true); // Ban đầu hiển thị lỗi Assign font to elements
    const [fontNameError, setFontNameError] = useState(true); // Ban đầu hiển thị lỗi Font Name
    const [saveButtonClicked, setSaveButtonClicked] = useState(false); // Thêm state mới
    const [isCleared, setIsCleared] = useState(false); // Track if file upload has been cleared
    const [showMediaCard, setShowMediaCard] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showVideoCard, setShowVideoCard] = useState(false);
    const [fontSize, setFontSize] = useState('');
    const [selectedElements, setSelectedElements] = useState({
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

    const uploadedFontFaceRef = useRef(null);
    const validImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    const alphabetUpper = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z";
    const alphabetLower = "a b c d e f g h i j k l m n o p q r s t u v w x y z";
    const numbers = "0 1 2 3 4 5 6 7 8 9";
    const specialCharacters = "! @ # $ % ^ & * ( ) ~"
    const bannerRef = useRef(null); // Thêm ref cho Banner

    const navigate = useNavigate();
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const previewStyle = (fontName) => ({
        fontFamily: fontName,
        fontSize: '22px',
        lineHeight: '1',
        letterSpacing: '0.05em',
        whiteSpace: 'pre-wrap',
    });

    const handleTabChange = useCallback((selectedTabIndex) => {
        setSelected(selectedTabIndex);
        if (selectedTabIndex === 1) {
            // Reset fileName if switching to Google Fonts tab
            setFileName('');
        } else {
            // Reset fontNamesSelected if switching to Upload tab
            setFontNamesSelected('');
        }
    }, []);

    const handleNameChange = useCallback((newName) => {
        setFileName(newName);
        if (newName) {
            setNameError(false); // Ẩn lỗi "Name file" khi có giá trị
        } else {
            setNameError(true); // Hiển thị lỗi nếu tên file rỗng (tùy logic validation)
        }
    }, []);

    const handleLearnMoreClick = () => {
        setShowVideoCard(true);
        setShowMediaCard(false); // Ẩn MediaCard khi mở video card
    };

    const fetchGoogleFontsFromApi = async () => {
        try {
            const apiKey = "AIzaSyAgUcqZQ2hzVAmzfzKZOjeuF5hxfMaFKLQ";
            const response = await fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const googleFontsOptions = data.items.map((font) => ({
                label: font.family,
                value: font.family,
                variants: font.variants,
                style: `@import url('https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}&display=swap');`,
            }));
            setGoogleFonts(googleFontsOptions);
            loadFontsForPage(1, googleFontsOptions);
        } catch (error) {
            console.error('Error fetching Google Fonts API:', error);
            setToastContent('Error fetching Google Fonts: ' + error);
            setToastActive(true);
        }
    };

    const fetchFonts = async () => {
        try {
            await api.datafontgg.findMany();
            fetchGoogleFontsFromApi();
        } catch (error) {
            console.error('Error fetching fonts:', error);
            setToastContent('Error fetching fonts: ' + error);
            setToastActive(true);
        }
    };

    const uploadFileToGadget = async (file, keyfont) => {
        setLoading(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64Data = reader.result.split(',')[1];
                const selectedTags = Object.keys(selectedElements)
                    .filter((key) => selectedElements[key])
                    .join(',');
                try {
                    const response = await api.datafontgg.create({
                        name: fileName,
                        link: base64Data,
                        keyfont: keyfont,
                        checkbox: selectedTags,
                        size: fontSize,
                    });

                    setFontNamesSelected(fileName);

                    fetchFonts();
                    await handleCreateUpdateSelectfont(keyfont, null, response);
                } catch (error) {
                    console.error('Error uploading/updating file to Gadget:', error);
                    setToastContent('Upload failed. Please try again: ' + error.message);
                    setToastActive(true);
                } finally {
                    setLoading(false);
                }
            };

            reader.onerror = (error) => {
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

    const handleDropZoneDrop = useCallback(
        (_dropFiles, acceptedFiles, _rejectedFiles) => {
            const file = acceptedFiles[0];
            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
            setFile(file);
            setFileName(fileNameWithoutExt);
            setNameError(false); // Thêm dòng này để ẩn lỗi "Name file"
            setIsCleared(false); // Reset cleared state when new file is uploaded

            // Xóa font cũ nếu tồn tại
            if (uploadedFontFaceRef.current) {
                document.fonts.delete(uploadedFontFaceRef.current);
                uploadedFontFaceRef.current = null;
            }

            const fontUrl = URL.createObjectURL(file);
            const fontFace = new FontFace(fileNameWithoutExt, `url(${fontUrl})`);

            fontFace.load()
                .then(() => {
                    document.fonts.add(fontFace);
                    setFontNamesSelected(fileNameWithoutExt);
                    uploadedFontFaceRef.current = fontFace;
                    setFileError(false); // Đã có dòng này để ẩn lỗi "Add file"
                })
                .catch((error) => {
                    console.error('Error loading font:', error);
                    setToastContent('Failed to load font for preview. Please check the file format.');
                    setToastActive(true);
                });
        },
        []
    );

    const handleElementChange = useCallback((element) => {
        setSelectedElements((prevState) => {
            const newState = { ...prevState, [element]: !prevState[element] };
            setAllElementsSelected(Object.values(newState).every((v) => v));
            return newState;
        });
        setElementsError(false); // Thêm dòng này để ẩn lỗi khi có thao tác chọn element
    }, []);

    const handleAllElementsChange = useCallback(() => {
        setAllElementsSelected((prev) => {
            const newState = !prev;
            setSelectedElements({
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
        setElementsError(false); // Thêm dòng này để ẩn lỗi khi có thao tác chọn "All" hoặc bỏ chọn "All"
    }, []);

    const handleSave = async () => {
        setSaveButtonClicked(true); // Set state khi nút save được ấn
        // Reset error messages before validation
        setFileError(false);
        setNameError(false);
        setElementsError(false);

        let hasError = false;

        if (!file) {
            setFileError(true);
            setBannerContent("Drop zone can't be blank."); // Updated banner message
            setBannerActive(true);
            hasError = true;
        }
        if (!fileName) {
            setNameError(true);
            setBannerContent("The name field can't be blank."); // Updated banner message
            setBannerActive(true);
            hasError = true;
        }
        const selectedTags = Object.keys(selectedElements)
            .filter((key) => selectedElements[key])
            .join(',');
        if (!selectedTags) {
            setElementsError(true);
            setBannerContent("Option checkbox can't be blank."); // Keep original message for elements
            setBannerActive(true);
            hasError = true;
        }

        if (hasError) {
            // setBannerContent("Option checkbox can't be blank."); // Optional: Show banner message for multiple errors
            // setBannerActive(true);
            return;
        }

        try {
            await uploadFileToGadget(file, "upload");
            setBannerActive(false); // Thêm dòng này để tắt banner khi lưu thành công
        } catch (error) {
            console.error('Error saving font:', error);
            setToastContent('Failed to save font: ' + error);
            setToastActive(true);
        }
    };

    const handleUpdate = async () => {
        setSaveButtonClicked(true);
        setLoading(true);

        // Reset all error states
        setNameError(false);
        setFileError(false);
        setFontNameError(false);
        setElementsError(false);

        // Validate based on the active tab
        let hasError = false;

        // Common validation for both tabs: elements selection
        const selectedTags = Object.keys(selectedElements)
            .filter(key => selectedElements[key]);
        if (selectedTags.length === 0) {
            setElementsError(true);
            setBannerContent("Option checkbox can't be blank."); // Keep original message for elements
            setBannerActive(true);
            hasError = true;
        }
        // Tab-specific validation
        if (selected === 0) { // Upload Font tab
            if (!fileName) {
                setNameError(true);
                setBannerContent("The name field can't be blank."); // Updated banner message
                setBannerActive(true);
                hasError = true;
            }
            // Note: In edit mode, we don't require a new file upload
            // so we don't check for !file here
        } else if (selected === 1) { // Google Fonts tab
            if (!fontNamesSelected) {
                setFontNameError(true);
                setBannerContent("The Font Name can't be blank."); // Updated banner message
                setBannerActive(true);
                hasError = true;
            }
        }

        if (hasError) {
            // setBannerContent("Please fill all required fields");
            // setBannerActive(true);
            setLoading(false);
            return;
        }

        try {
            // Get the shop ID
            const shop = await api.shopifyShop.findFirst({ select: { id: true } });
            if (!shop || !shop.id) {
                throw new Error('Could not fetch Shop ID');
            }
            const shopid = String(shop.id);

            console.log('Updating font for shop ID:', shopid);

            // Get the current font data
            const fontData = await api.datafontgg.findOne(fontIdFromUrl, {
                select: {
                    id: true,
                    name: true,
                    link: true,
                    keyfont: true,
                    checkbox: true
                }
            });

            // Store original font type to check for changes later
            const originalFontType = fontData.keyfont;

            console.log('Original font data:', {
                id: fontData.id,
                name: fontData.name,
                keyfont: fontData.keyfont,
                checkbox: fontData.checkbox
            });

            const selectedTagsStr = selectedTags.join(',');

            // Create update data object
            let updatedFontName;
            if (selected === 1) { // Google Fonts tab
                // For Google fonts, use fontNamesSelected which contains the Google font name
                updatedFontName = fontNamesSelected;
                console.log('Using Google font name from selection:', updatedFontName);
            } else {
                // For uploaded fonts, use fileName
                updatedFontName = fileName;
                console.log('Using upload font name:', updatedFontName);
            }

            // Set keyfont based on selected tab index
            const newFontType = selected === 0 ? 'upload' : 'google';

            const updateData = {
                name: updatedFontName,
                checkbox: selectedTagsStr,
                keyfont: newFontType, // Set based on the selected tab
                size: fontSize,
            };

            let fontLink = fontData.link;

            // Handle different font types
            if (newFontType === 'google') {
                // For Google fonts, ensure proper link format with proper encoding
                // Use fontNamesSelected for Google fonts, not fileName
                const formattedFontName = fontNamesSelected.trim().replace(/ /g, '+');
                fontLink = `https://fonts.googleapis.com/css2?family=${formattedFontName}&display=swap`;
                updateData.link = fontLink;

                console.log('Updating Google font with name:', fontNamesSelected);
                console.log('Formatted font name for URL:', formattedFontName);
                console.log('Google font link:', fontLink);
            } else if (file) {
                // For uploaded fonts with new file
                console.log('Processing new uploaded font file:', fileName);
                const reader = new FileReader();
                reader.readAsDataURL(file);

                await new Promise((resolve, reject) => {
                    reader.onloadend = async () => {
                        const base64Data = reader.result.split(',')[1];
                        updateData.link = base64Data;
                        fontLink = base64Data;
                        console.log('New font file processed successfully');
                        console.log('Font data size:', base64Data.length, 'bytes');
                        resolve();
                    };
                    reader.onerror = (error) => {
                        console.error('Error reading font file:', error);
                        reject(error);
                    };
                });
            } else {
                console.log('Keeping existing font link:', fontLink ? `${fontLink.substring(0, 30)}...` : 'none');
            }

            // Update the datafontgg record
            console.log('Updating datafontgg record with:', {
                id: fontIdFromUrl,
                name: updateData.name,
                keyfont: updateData.keyfont,
                checkbox: updateData.checkbox,
                linkType: typeof updateData.link,
                linkLength: updateData.link ? updateData.link.length : 0
            });

            const updatedFont = await api.datafontgg.update(fontIdFromUrl, updateData);
            console.log('Font record updated successfully:', updatedFont.id);

            // Find any existing selectfont record
            const selectfontRecords = await api.selectfont.findMany({
                filter: {
                    shopid: { equals: shopid },
                    namespace: { equals: 'setting' },
                    key: { equals: 'style' },
                },
            });

            console.log('Found selectfont records:', selectfontRecords.length);

            // Create a robust value object for the selectfont record
            const value = {
                id: updatedFont.id,
                name: updatedFont.name,
                link: newFontType === 'google' ? fontLink : (file ? updatedFont.link : fontData.link),
                selectedElements: selectedTagsStr,
                keyfont: newFontType, // Using the new font type
                fontSize: fontSize,
                updatedAt: new Date().toISOString(),
                // Additional metadata for better tracking
                fontType: newFontType === 'google' ? 'google' : 'custom',
                elements: selectedTagsStr.split(','),
                // Use the appropriate font family name based on the font type
                fontFamily: newFontType === 'google' ? fontNamesSelected : fileName,
            };

            console.log('Updating selectfont with value:', {
                id: value.id,
                name: value.name,
                keyfont: value.keyfont,
                selectedElements: value.selectedElements,
                fontFamily: value.fontFamily,
                fontType: value.fontType
            });

            if (selectfontRecords.length === 0) {
                console.log('Creating new selectfont record');
                await api.selectfont.create({
                    shopid: shopid,
                    namespace: 'setting',
                    key: 'style',
                    value: value,
                });
            } else {
                console.log('Updating existing selectfont record:', selectfontRecords[0].id);
                await api.selectfont.update(selectfontRecords[0].id, {
                    value: value,
                });
            }

            // Call update1 global action to update the theme font
            try {
                console.log('Applying font changes to theme');
                await api.update1();
                console.log('Theme update completed successfully');
            } catch (error) {
                console.error('Theme update error:', error);
                throw new Error('Failed to update theme: ' + error.message);
            }

            // Check if font type has changed and show appropriate notification
            const fontTypeChanged = originalFontType !== newFontType;
            let successMessage = 'Font updated successfully!';

            if (fontTypeChanged) {
                setToastContent(`Font type changed to ${newFontType === 'google' ? 'Google Font' : 'Upload Font'}`);
                setToastActive(true);
            }

            // Navigate and show notification
            navigate('/', {
                state: {
                    toastMessage: successMessage
                }
            });

        } catch (error) {
            console.error('Error updating font:', error);
            setToastContent('Failed to update font: ' + error.message);
            setToastActive(true);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdateSelectfont = async (keyfont, selectedFonts, createdFontData = null) => {
        try {
            setSaveButtonClicked(true);
            setFontNameError(false);
            setElementsError(false);

            let hasError = false;

            const shop = await api.shopifyShop.findFirst({ select: { id: true } });
            if (!shop || !shop.id) {
                throw new Error('Could not fetch Shop ID');
            }
            const shopid = String(shop.id);

            // --- Khai báo selectedFontDetail ở đây ---
            let selectedFontDetail;
            // --- Lấy selectedTags một lần ở đây cho cả hai trường hợp ---
            const selectedTags = Object.keys(selectedElements)
                .filter((key) => selectedElements[key])
                .join(',');


            if (keyfont === 'google') {
                // --- Validation cho Google Font ---
                if (!selectedTags) {
                    setElementsError(true);
                    setBannerContent("Option checkbox can't be blank.");
                    setBannerActive(true);
                    hasError = true;
                }
                if (!fontNamesSelected) {
                    setFontNameError(true);
                    setBannerContent("The Font Name can't be blank.");
                    setBannerActive(true);
                    hasError = true;
                }
                if (hasError) {
                    // Không cần setLoading(false) ở đây vì chưa set true
                    return;
                }

                setLoading(true); // Bắt đầu loading sau validation

                const fontDetails = googleFonts.find((font) => font.label === fontNamesSelected);
                if (!fontDetails) {
                    setBannerContent('Please select a valid font.');
                    setBannerActive(true);
                    setLoading(false); // Dừng loading nếu font không hợp lệ
                    return;
                }

                // --- 1. Tạo bản ghi datafontgg TRƯỚC ---
                const createdGoogleFontRecord = await api.datafontgg.create({
                    name: fontDetails.label, // Sử dụng tên từ googleFonts
                    link: `https://fonts.googleapis.com/css2?family=${fontDetails.label.replace(/ /g, '+')}&display=swap`,
                    keyfont: 'google',
                    checkbox: selectedTags,
                    size: fontSize,
                });
                fetchFonts(); // Gọi fetchFonts nếu cần cập nhật danh sách ngay

                // --- 2. Gán kết quả (với ID database) cho selectedFontDetail ---
                selectedFontDetail = createdGoogleFontRecord;


            } else if (keyfont === 'upload') {
                // --- Xử lý cho Upload Font (như cũ, nhưng đảm bảo selectedFontDetail được gán) ---
                setFontNamesSelected(createdFontData.name); // Cập nhật tên font hiển thị

                // Validation selectedTags cho upload
                if (!selectedTags) {
                    setElementsError(true); // Thêm validation này ở đây nếu chưa có
                    setBannerContent('Option checkbox can\'t be blank.');
                    setBannerActive(true);
                    // Không cần setLoading(false) vì nó được quản lý bởi uploadFileToGadget
                    return;
                }

                if (!createdFontData) {
                    // Logic fallback tìm font mới nhất (ít khi xảy ra nếu luồng đúng)
                    const latestFont = await api.datafontgg.findMany({
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        filter: { keyfont: { equals: "upload" } },
                    });
                    if (latestFont.length === 0) {
                        setToastContent('No fonts uploaded yet.');
                        setToastActive(true);
                        return; // Thoát nếu không có font nào
                    }
                    selectedFontDetail = latestFont[0];
                } else {
                    selectedFontDetail = createdFontData; // Sử dụng dữ liệu đã được tạo
                }

                // Không cần setLoading(true) ở đây vì đã được set trong uploadFileToGadget
            } else {
                // Xử lý trường hợp keyfont không hợp lệ nếu cần
                setLoading(false); // Dừng loading nếu có
                throw new Error(`Invalid font key type: ${keyfont}`);
            }

            // --- Logic chung sau khi đã có selectedFontDetail với ID database ---

            // selectedTags đã được lấy ở trên

            const selectfontRecords = await api.selectfont.findMany({
                filter: {
                    shopid: { equals: shopid },
                    namespace: { equals: 'setting' },
                    key: { equals: 'style' },
                },
            });

            // --- 3. Tạo đối tượng value với ID database chính xác ---
            const value = {
                id: selectedFontDetail.id, // <-- Luôn là ID database
                name: selectedFontDetail.name,
                link: selectedFontDetail.link,
                selectedElements: selectedTags,
                keyfont: selectedFontDetail.keyfont, // Thêm keyfont vào value
                fontSize: fontSize,
                updatedAt: new Date().toISOString() // Thêm timestamp
            };

            // --- Tạo hoặc cập nhật bản ghi selectfont (như cũ) ---
            let data; // Đổi tên biến để tránh trùng lặp
            if (selectfontRecords.length === 0) {
                data = await api.selectfont.create({
                    // selectfont: { // Cấu trúc cũ
                    shopid: shopid,
                    namespace: 'setting',
                    key: 'style',
                    value: value,
                    // }
                });
            } else {
                data = await api.selectfont.update(selectfontRecords[0].id, {
                    // selectfont: { // Cấu trúc cũ
                    value: value,
                    // }
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
            setBannerActive(false);
            // navigate('/', {
            //     state: {
            //         toastMessage: 'Font applied successfully!',
            //         // Sử dụng ID database chính xác từ selectedFontDetail
            //         appliedFontId: selectedFontDetail.id
            //     }
            // });
        } catch (error) {
            console.error('Error creating/updating selectfont:', error);
            setToastContent('Error saving selected font: ' + error.message);
            setToastActive(true);
        } finally {
            setLoading(false);
        }
    };

    const handleFontChange = (value) => {
        setFontsSelected((prevFonts) => {
            const newFonts = {};
            newFonts[value] = !prevFonts[value];

            const selectedFontArray = Object.keys(newFonts)
                .filter(key => newFonts[key]); // Lọc lấy các font được chọn

            let newFontName = "";
            if (selectedFontArray.length > 0) {
                newFontName = selectedFontArray[0]; // Lấy tên font đầu tiên được chọn (nếu có)
            }

            setFontNamesSelected(newFontName); // Cập nhật fontNamesSelected dựa trên checkbox

            return newFonts;
        });
        setFontNameError(false);
    };

    const handleFontSelect = async () => {
        const selectedFonts = Object.keys(fontsSelected)
            .filter((key) => fontsSelected[key])
            .join(',');
        const selectedFontNames = Object.keys(fontsSelected)
            .filter((key) => fontsSelected[key])
            .join(', ');

        setSelectedFont(selectedFonts);
        setFontNamesSelected(selectedFontNames);
        setShowModal(false);
        if (!selectedFonts) {
            setBannerContent('Please select at least one font.');
            setBannerActive(true);
            return;
        }
    };

    const handleClearDropZone = () => {
        if (uploadedFontFaceRef.current) {
            document.fonts.delete(uploadedFontFaceRef.current);
            uploadedFontFaceRef.current = null;
        }
        setFile(null);
        setFileName('');
        setFontNamesSelected('');
        setIsCleared(true); // Set cleared state to true
    };
    const handleDeleteFont = async (id) => {
        try {
            setDeleting(true);
            await api.datafontgg.delete(id);

            // Kiểm tra nếu font bị xóa là font đang active
            const shop = await api.shopifyShop.findFirst({ select: { id: true } });
            if (!shop || !shop.id) {
                throw new Error('Could not fetch Shop ID');
            }
            const shopid = String(shop.id);

            // Lấy thông tin selectfont hiện tại
            const selectfontRecords = await api.selectfont.findMany({
                filter: {
                    shopid: { equals: shopid },
                    namespace: { equals: 'setting' },
                    key: { equals: 'style' },
                },
            });

            // Nếu có bản ghi selectfont và font đang active trùng với font bị xóa
            if (selectfontRecords.length > 0 && selectfontRecords[0].value?.id === id) {
                // Xóa thông tin font khỏi selectfont
                await api.selectfont.update(selectfontRecords[0].id, {
                    value: null
                });

                // Cập nhật theme để xóa font
                await api.update1();
            }

            navigate('/', {
                state: {
                    showDeleteToast: true,
                    toastMessage: 'Font deleted successfully!'
                }
            });

            if (setFontDataFromAppPage) {
                const updatedFontData = await api.datafontgg.findMany();
                setFontDataFromAppPage(updatedFontData);
            }
        } catch (error) {
            console.error('Error deleting font:', error);
            setToastContent('Failed to delete font: ' + error);
            setToastActive(true);
        }
    }

    const handleSearchChange = useCallback(
        debounce((newSearch) => {
            setSearchQuery(newSearch);
            setCurrentPage(1);
        }, 300),
        []
    );

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        loadFontsForPage(newPage);
    };
    const handleModalOpen = useCallback(() => {
        setSearchQuery('');
        setFontsSelected({});
        if (selectedFont) {
            const selectedFontArray = selectedFont.split(',');
            const newFontSelected = {};
            googleFonts.forEach((font) => {
                if (selectedFontArray.includes(font.value)) {
                    newFontSelected[font.value] = true;
                }
            });
            setFontsSelected(newFontSelected);
        }
        setShowModal(true);
    }, [selectedFont, googleFonts]);

    const handleModalClose = useCallback(() => {
        setShowModal(false);
    }, []);

    const tabs = [
        {
            id: 'upload-tab',
            content: 'Upload Font',
            panelID: 'upload-tab-content',
        },
        {
            id: 'google-font-tab',
            content: 'Google Fonts',
            panelID: 'google-font-tab-content',
        },
    ];
    const filteredFonts = googleFonts.filter((font) => font.label.toLowerCase().includes(searchQuery.toLowerCase()));
    const urlParams = new URLSearchParams(location.search);
    const typeParam = urlParams.get("type");
    const totalPages = Math.ceil(filteredFonts.length / FONT_PER_PAGE);
    const paginatedFonts = filteredFonts.slice((currentPage - 1) * FONT_PER_PAGE, currentPage * FONT_PER_PAGE);
    const fileUpload = !file && !(isEditMode && fileName) && (
        <DropZone.FileUpload
            actionHint="Accepts .woff, .otf, and .ttf"
            actionTitle="Add file"
        />
    );

    const loadFontsForPage = (page, fonts = googleFonts) => {
        const start = (page - 1) * FONT_PER_PAGE;
        const end = start + FONT_PER_PAGE;
        const fontsToLoad = fonts.slice(start, end);
        fontsToLoad.forEach((font) => {
            const style = document.createElement('style');
            style.textContent = font.style;
            if (!loadedFonts.includes(font.value)) {
                document.head.appendChild(style);
                setLoadedFonts((prevLoadedFonts) => [...prevLoadedFonts, font.value]);
            }
        });
    };

    const uploadedFile = file && (
        <BlockStack>
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
        </BlockStack>
    );

    useEffect(() => {
        fetchFonts();
    }, []);

    useEffect(() => {
        if (typeParam === 'google-font-tab') {
            setSelected(1);
        } else {
            setSelected(0);
        }
    }, [typeParam]);
    useEffect(() => {
        if (fontNamesSelected) {
            const fontDetails = googleFonts.find((font) => font.label === fontNamesSelected);
            if (fontDetails) {
                const style = document.createElement('style');
                style.textContent = `@import url('https://fonts.googleapis.com/css2?family=${fontDetails.label.replace(/ /g, '+')}&display=swap');`;
                document.head.appendChild(style);
                return () => {
                    document.head.removeChild(style); // Cleanup on unmount or font change
                };
            }
        }
    }, [fontNamesSelected, googleFonts]);
    useEffect(() => {
        if (fontDetails?.keyfont === 'upload' && fontDetails?.link) {
            // Lấy định dạng file từ tên font
            const getFontFormat = (fileName) => {
                const extension = fileName.split('.').pop().toLowerCase();
                switch (extension) {
                    case 'woff': return 'woff';
                    case 'woff2': return 'woff2';
                    case 'ttf': return 'truetype';
                    case 'otf': return 'opentype';
                    default: return 'woff2';
                }
            };

            const fontName = fontDetails.name.replace(/\.[^/.]+$/, ""); // Bỏ phần mở rộng
            const format = getFontFormat(fontDetails.name);

            const style = document.createElement('style');
            style.textContent = `
            @font-face {
              font-family: '${fontName}';
              src: url(data:font/${format};base64,${fontDetails.link}) format('${format}');
            }
          `;

            document.head.appendChild(style);
            return () => document.head.removeChild(style);
        }
    }, [fontDetails]);

    // Reset error states on component mount
    useEffect(() => {
        setFileError(false);
        setNameError(false);
        setElementsError(false);
        setFontNameError(false);
        setIsCleared(false); // Reset cleared state on component mount
    }, []);

    useEffect(() => {
        if (bannerActive && bannerRef.current) {
            bannerRef.current.focus(); // Focus vào Banner
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll lên đầu trang
        }
    }, [bannerActive]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const typeParam = params.get('type');
        const nameParam = params.get('name');
        const elementsParam = params.get('elements');

        if (typeParam) {
            if (typeParam === 'google-font-tab') {
                setSelected(1);
            } else {
                setSelected(0);
            }
        }
        if (nameParam) {
            setFileName(nameParam);
            setFontNamesSelected(nameParam);
            setNameError(false);
        }
        if (elementsParam) {
            const elementsArray = elementsParam.split(',');
            //  Đảm bảo dùng functional update và tạo bản sao state (đã sửa ở các lần trước)
            setSelectedElements(prevState => {
                const updatedElements = { ...prevState };
                elementsArray.forEach(tag => {
                    if (updatedElements.hasOwnProperty(tag)) {
                        updatedElements[tag] = true;
                    }
                });
                return updatedElements;
            });
            setElementsError(false);
        }
    }, [location.search]); // Dependency array chỉ cần location.search

    useEffect(() => {
        const loadFontData = async () => {
            if (isEditMode && fontIdFromUrl) {
                try {
                    const fontData = await api.datafontgg.findOne(fontIdFromUrl, {
                        select: {
                            id: true,
                            name: true,
                            keyfont: true,
                            link: true,
                            checkbox: true,
                            size: true
                        }
                    });

                    // Set tab based on font type
                    if (fontData.keyfont === 'google') {
                        setSelected(1); // Google Fonts tab
                        setFontNamesSelected(fontData.name);
                    } else {
                        setSelected(0); // Upload Font tab
                        setFileName(fontData.name);
                    }
                    setFontSize(fontData.size || '');
                    // Xử lý selected elements
                    const elements = fontData.checkbox?.split(',') || [];
                    const newSelectedElements = { ...selectedElements };
                    elements.forEach(tag => {
                        if (newSelectedElements.hasOwnProperty(tag)) {
                            newSelectedElements[tag] = true;
                        }
                    });
                    setSelectedElements(newSelectedElements);

                    // Xử lý all selected
                    setAllElementsSelected(elements.length === Object.keys(selectedElements).length);

                } catch (error) {
                    console.error('Error loading font data:', error);
                    setToastContent('Error loading font data: ' + error.message);
                    setToastActive(true);
                }
            }
        };

        loadFontData();
    }, [isEditMode, fontIdFromUrl]);

    return (
        <AppProvider>
            <Frame>
                <Page title="Fonts" backAction={{ content: 'Shop Information', onAction: () => navigate('/'), }}>
                    {showMediaCard && (
                        <div style={{ marginBottom: '20px', width: '100%', height: '25%' }}>
                            <MediaCard
                                title="Getting started video guide"
                                primaryAction={{
                                    content: 'Learn more',
                                    onAction: handleLearnMoreClick,
                                }}
                                description={`Let see video guide to learn how to use App`}
                                popoverActions={[{
                                    content: 'Dismiss',
                                    onAction: () => setShowMediaCard(false) // Thêm logic ẩn card
                                }]}
                            >
                                <VideoThumbnail
                                    videoLength={118}
                                    videoProgress={118}
                                    showVideoProgress
                                    thumbnailUrl="https://blog.tcea.org/wp-content/uploads/2021/08/font-heading-image.png"
                                    onClick={() => console.log('clicked')}
                                />
                            </MediaCard>
                        </div>
                    )}

                    {showVideoCard && (
                        <BlockStack>
                            <div style={{ marginBottom: '20px' }}>
                                <Card
                                    title="Video Guide"
                                    sectioned
                                    actions={[{
                                        content: 'Close video',
                                        onAction: () => setShowVideoCard(false)
                                    }]}
                                >
                                    {/* Thêm nút close icon ở góc phải trên */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        zIndex: 1
                                    }}>
                                        <Button
                                            icon={XIcon}
                                            onClick={() => setShowVideoCard(false)}
                                            accessibilityLabel="Dismiss video"
                                            plain
                                        />
                                    </div>

                                    <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                        <iframe
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%',
                                                border: 'none',
                                                borderRadius: '8px'
                                            }}
                                            src="https://cdn.shopify.com/videos/c/o/v/80d4e79e2e094db2a21192ca5826543f.mp4"
                                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                </Card>
                            </div>
                        </BlockStack>
                    )}

                    <Layout>
                        <Layout.Section >
                            <BlockStack style={{ flexDirection: 'column', gap: '15px', marginBottom: '50px' }}>
                                {bannerActive && (
                                    <Banner ref={bannerRef} title="There’s an error with this Fonts setting" onDismiss={() => setBannerActive(false)} tone="critical">
                                        <p>{bannerContent}</p>
                                    </Banner>
                                )}
                                <Card>
                                    <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} fitted >
                                        <BlockStack>
                                            {selected === 0 && (
                                                <BlockStack style={{ flexDirection: 'column', gap: '10px' }}>
                                                    <BlockStack style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text variant="headingMd" as="h6" >
                                                            Add file
                                                        </Text>
                                                        {selected === 0 && ((file || (isEditMode && fileName)) && !isCleared) && <Button onClick={handleClearDropZone}>Clear</Button>}
                                                    </BlockStack>

                                                    <DropZone allowMultiple={false} onDrop={handleDropZoneDrop}>
                                                        {!isCleared && (uploadedFile || (isEditMode && !file && fileName && (
                                                            <BlockStack>
                                                                <Thumbnail
                                                                    size="small"
                                                                    alt="Existing font"
                                                                    source={NoteIcon}
                                                                />
                                                                <div>
                                                                    {fileName}
                                                                    <Text variant="bodySm" as="p">
                                                                        (Existing font file)
                                                                    </Text>
                                                                </div>
                                                            </BlockStack>
                                                        )))}
                                                        {fileUpload || isCleared}
                                                    </DropZone>
                                                    {saveButtonClicked && fileError && <InlineError message="Please upload a font file" fieldID="addFileError" />}
                                                    <div>
                                                        <p>
                                                            1.Need more fonts? Let's buy the recommended font from NitroApps here:
                                                            <a href="https://www.fontspring.com?refby=NitroApps" target="_blank" rel="noopener noreferrer"> https://www.fontspring.com?refby=NitroApps </a>
                                                        </p>
                                                        <p>
                                                            2.or free fonts here:
                                                            <a href="https://fonts.adobe.com" target="_blank" rel="noopener noreferrer"> https://fonts.adobe.com </a>,
                                                            <a href="https://www.fonts.com" target="_blank" rel="noopener noreferrer"> https://www.fonts.com </a>,
                                                            <a href="https://webfonts.ffonts.net" target="_blank" rel="noopener noreferrer"> https://webfonts.ffonts.net </a>,
                                                            <a href="https://fontsforweb.com" target="_blank" rel="noopener noreferrer"> https://fontsforweb.com </a>,
                                                            <a href="https://www.dafont.com" target="_blank" rel="noopener noreferrer"> https://www.dafont.com </a>
                                                        </p>
                                                        <p>
                                                            3.Convert file to woff:
                                                            <a href="https://cloudconvert.com/otf-to-ttf" target="_blank" rel="noopener noreferrer"> https://cloudconvert.com/otf-to-ttf </a>
                                                        </p>
                                                    </div>
                                                    <Text variant="headingMd" as="h6" >
                                                        Name file
                                                    </Text>
                                                    <TextField
                                                        value={fileName}
                                                        onChange={handleNameChange}
                                                    />
                                                    {saveButtonClicked && nameError && <InlineError message="Please enter a font name" fieldID="nameFileError" />}
                                                    {/* <p >
                                                    The font name should be unique and simple text, no special characters.
                                                </p> */}
                                                </BlockStack>
                                            )}

                                            {selected === 1 && (
                                                <BlockStack style={{ flexDirection: 'column', gap: '15px' }}>
                                                    <Text variant="headingMd" as="h6" >
                                                        Font Name
                                                    </Text>
                                                    <TextField
                                                        value={fontNamesSelected || ''}
                                                        onChange={(newValue) => {
                                                            setSearchQuery(newValue);  // Cập nhật searchQuery để lọc danh sách
                                                            setFontNamesSelected(newValue); // Cập nhật fontNamesSelected
                                                        }}
                                                        placeholder="Search for the font name"
                                                        autoComplete="off"
                                                    // connectedRight={<Button primary>Confirm</Button>}
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
                                                    {fontNameError && <InlineError message="Please select at least one font option" fieldID="fontNameSelectError" />}
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
                                                </BlockStack>
                                            )}
                                        </BlockStack>
                                    </Tabs>
                                </Card>

                                <Grid>
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                        <Card title="Select Elements to Apply Font">
                                            <Text variant="headingMd" as="h6" >
                                                Assign font to elements
                                            </Text>

                                            <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '30px', marginTop: '10px' }}>
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
                                            {saveButtonClicked && elementsError && <InlineError message="Please select at least one option" fieldID="assignElementsError" />}
                                        </Card>
                                    </Grid.Cell>

                                    <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}>
                                        <Card title="Font Preview" sectioned>
                                            <Text variant="headingMd" as="h6">
                                                Preview font
                                            </Text>
                                            <BlockStack style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                marginTop: '5px',
                                                // alignItems: 'stretch', // Thay đổi alignItems thành 'stretch'
                                                // textAlign: 'center',
                                            }}>
                                                {/* Uppercase Alphabet */}
                                                <BlockStack style={{ border: '2px dashed #ccc', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                                                    <Text variant="bodySm" fontWeight="bold">Uppercase Alphabet: </Text>
                                                    <div style={previewStyle(fontNamesSelected)}>
                                                        {'\n' + alphabetUpper}
                                                    </div>
                                                </BlockStack>

                                                {/* Lowercase Alphabet */}
                                                <BlockStack style={{ border: '2px dashed #ccc', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                                                    <Text variant="bodySm" fontWeight="bold">Lowercase Alphabet: </Text>
                                                    <div style={previewStyle(fontNamesSelected)}>
                                                        {'\n' + alphabetLower}
                                                    </div>
                                                </BlockStack>

                                                {/* Numbers */}
                                                <BlockStack style={{ border: '2px dashed #ccc', padding: '10px', borderRadius: '4px', marginBottom: '10px' }}>
                                                    <Text variant="bodySm" fontWeight="bold">Numbers: </Text>
                                                    <div style={previewStyle(fontNamesSelected)}>
                                                        {'\n' + numbers}
                                                    </div>
                                                </BlockStack>

                                                {/* Special Characters */}
                                                <BlockStack style={{ border: '2px dashed #ccc', padding: '10px', borderRadius: '4px', marginBottom: '5px' }}>
                                                    <Text variant="bodySm" fontWeight="bold">Special Characters: </Text>
                                                    <div style={previewStyle(fontNamesSelected)}>
                                                        {'\n' + specialCharacters}
                                                    </div>
                                                </BlockStack>
                                            </BlockStack>
                                        </Card>
                                    </Grid.Cell>
                                </Grid>

                                {/* Custom stylesheets */}
                                <Card>
                                    <BlockStack style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <Text variant="headingMd" as="h6">
                                            Custom stylesheets
                                        </Text>

                                        <TextField
                                            value={fontSize}
                                            type="number"
                                            // min="1"
                                            onChange={(value) => {
                                                const numericValue = parseInt(value, 10);
                                                if (!isNaN(numericValue) && numericValue >= 0) {
                                                    setFontSize(value); // Cập nhật state nếu là số không âm
                                                } else if (value === '' || value === '-') {
                                                    setFontSize('1'); // Nếu người dùng nhập dấu trừ hoặc xóa hết, đặt về 0 (hoặc bạn có thể chọn không làm gì)
                                                }
                                            }}
                                            prefix="font-size:"
                                            placeholder="Your-Size-Settings"
                                            autoSize
                                            // suffix="px"
                                            clearButton
                                            onClearButtonClick={() => setFontSize('')}
                                            autoComplete="off"
                                        />
                                        {/* <Text variant="bodySm" as="p" >
                                            Minimum: 8px
                                        </Text> */}
                                    </BlockStack>
                                </Card>
                                <div title="Save">
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        {isEditMode ? ( // Nếu ở chế độ chỉnh sửa, hiển thị ButtonGroup với Update và Delete
                                            <ButtonGroup>
                                                <Button destructive onClick={() => { handleDeleteFont(fontToDeleteId); }} loading={deleting}>
                                                    Delete
                                                </Button>
                                                <Button
                                                    primary
                                                    onClick={handleUpdate}
                                                    loading={loading}
                                                    variant="primary"
                                                >
                                                    Update
                                                </Button>
                                            </ButtonGroup>
                                        ) : ( // Nếu không ở chế độ chỉnh sửa (chế độ Save), hiển thị ButtonGroup với Save và Back
                                            <ButtonGroup>
                                                <Button onClick={() => navigate('/')}>
                                                    Back
                                                </Button>
                                                <Button primary onClick={selected === 0 ? handleSave : () => handleCreateUpdateSelectfont('google', fontNamesSelected)} loading={loading} variant="primary">
                                                    Save
                                                </Button>
                                            </ButtonGroup>
                                        )}
                                    </div>
                                </div>

                            </BlockStack>
                        </Layout.Section>
                    </Layout>
                    {toastActive && (<Toast content={toastContent} onDismiss={() => setToastActive(false)} />)}
                </Page>
            </Frame>
        </AppProvider>
    );
}
