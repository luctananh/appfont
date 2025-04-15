import { Frame, Toast } from '@shopify/polaris';
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router";
import {
    EmptyState,
    Banner,
    BlockStack,
    Box,
    Button,
    Card,
    Layout,
    Page,
    Select,
    Text,
    Avatar,
    ButtonGroup,
    Spinner,
    MediaCard,
    VideoThumbnail,
    ResourceList,
    Filters,
    TextField,
    Checkbox,
    Icon,
    Popover,
    ActionList,
    Badge,
    Grid,
} from "@shopify/polaris";
import { api } from "../api";
import {
    EditIcon,
    DeleteIcon,
    MenuHorizontalIcon,
    ArrowLeftIcon,
    ArrowRightIcon,
    CheckIcon,
    MenuIcon,
    XIcon,
} from '@shopify/polaris-icons';

const FONT_PER_PAGE = 5;
const SELECTED_THEME_KEY = 'selectedThemeId'; // Key to store the selected theme in local storage

export default function AppPage() {
    const location = useLocation();
    const listCardRef = useRef(null);
    const [themes, setThemes] = useState([]);
    const [selectedThemeId, setSelectedThemeId] = useState(null);
    const [fontData, setFontData] = useState([]); // Store data from datafontgg
    const [currentPage, setCurrentPage] = useState(1); //track current page
    const [loading, setLoading] = useState(true);
    const [sortValue, setSortValue] = useState('DATE_MODIFIED_DESC'); // Still keep sortValue for ordering, but not used in ResourceList props anymore
    const [queryValue, setQueryValue] = useState('');
    const [bannerActive, setBannerActive] = useState(false); // State to track banner visibility
    const [bannerContent, setBannerContent] = useState(''); // State to keep banner content
    const [activePopover, setActivePopover] = useState(null);
    const [showVideoCard, setShowVideoCard] = useState(false);
    const [toastActive, setToastActive] = useState(false);
    const [toastContent, setToastContent] = useState('');
    const [errorActive, setErrorActive] = useState(false);
    const [errorContent, setErrorContent] = useState('');
    const [applyingFontId, setApplyingFontId] = useState(null);
    const [currentAppliedFont, setCurrentAppliedFont] = useState(null);
    const [showMediaCard, setShowMediaCard] = useState(true);
    const navigate = useNavigate(); // Initialize useNavigate
    // --- TÍNH TOÁN SỐ LƯỢNG FONT ---
    const googleFontsCount = fontData.filter(font => font.keyfont === 'google').length;
    // Giả sử font upload có keyfont là 'upload' hoặc khác 'google'
    const uploadFontsCount = fontData.filter(font => font.keyfont && font.keyfont !== 'google').length;
    const totalFontsCount = fontData.length;
    // --- KẾT THÚC TÍNH TOÁN ---
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const handleLearnMoreClick = () => {
        setShowVideoCard(true);
        setShowMediaCard(false); // Ẩn MediaCard khi mở video card
    };

    const handleRowClick = (font) => {
        let type = font.keyfont === 'google' ? 'google-font-tab' : 'upload-tab'; // Xác định tab dựa trên keyfont
        // let elementsString = '';
        // if (font.selectfont && font.selectfont.value && font.selectfont.value.selectedElements) {
        //     elementsString = font.selectfont.value.selectedElements;
        // }
        let elementsString = font.checkbox || ''; // Lấy trực tiếp từ font.checkbox hoặc gán chuỗi rỗng nếu không có
        navigate(`/about?type=${type}&name=${font.name}&elements=${elementsString}&edit=true&fontId=${font.id}&size=${font.size}`); // Điều hướng đến trang FontManager với parameters
    };


    // Fetch themes and fonts from the api
    // Bên trong useEffect(() => { async function fetchData() { ... } ... }, []);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // --- THÊM: Lấy Shop ID (cần thiết để truy vấn selectfont) ---
                const shop = await api.shopifyShop.findFirst({ select: { id: true } });
                const shopid = shop?.id ? String(shop.id) : null;
                // --- KẾT THÚC THÊM ---

                // Fetch themes (như cũ)
                const themeResult = await api.shopifyTheme.findMany();
                const themeOptions = themeResult.map((theme) => ({
                    label: theme.name,
                    value: theme.id,
                }));
                setThemes(themeOptions);

                // Fetch all fonts (như cũ)
                const fontResult = await api.datafontgg.findMany();
                setFontData(fontResult);

                // --- THÊM: Lấy ID font đang active từ selectfont ---
                if (shopid) { // Chỉ thực hiện nếu có shopid
                    const selectfontRecords = await api.selectfont.findMany({
                        filter: {
                            shopid: { equals: shopid },
                            namespace: { equals: 'setting' },
                            key: { equals: 'style' },
                        },
                        // Chỉ lấy trường value để tối ưu
                        select: { value: true }
                    });

                    // Kiểm tra xem bản ghi có tồn tại và có ID trong value không
                    if (selectfontRecords.length > 0 && selectfontRecords[0].value && selectfontRecords[0].value.id) {
                        // Set state currentAppliedFont với ID lấy được
                        setCurrentAppliedFont(selectfontRecords[0].value.id);
                    }
                } else {
                    console.warn("AppPage: Could not fetch Shop ID, unable to determine initially applied font.");
                }
                // --- KẾT THÚC THÊM ---

                // Set the selected theme from local storage (như cũ)
                const storedThemeId = localStorage.getItem(SELECTED_THEME_KEY);
                if (storedThemeId) { // Có thể bỏ điều kiện && !selectedThemeId nếu muốn luôn lấy từ LS khi load
                    setSelectedThemeId(storedThemeId);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                // Cân nhắc hiển thị lỗi cho người dùng
                setErrorContent("Failed to load initial data. Please try refreshing.");
                setErrorActive(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []); // Dependency array rỗng để chạy 1 lần khi mount

    useEffect(() => {
        if (listCardRef.current) {
            listCardRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [currentPage]);

    useEffect(() => {
        if (location.state) {
            // Check if we have a toast message or showDeleteToast flag
            if (location.state.toastMessage) {
                setToastContent(location.state.toastMessage);
                setToastActive(true);

                // Reset state navigation
                navigate(location.pathname, {
                    replace: true,
                    state: null
                });
            } else if (location.state.showDeleteToast && location.state.deleteMessage) {
                // Handle delete toast specifically for success messages
                setToastContent(location.state.deleteMessage);
                setToastActive(true);

                // Reset state navigation
                navigate(location.pathname, {
                    replace: true,
                    state: null
                });
            } else if (location.state.errorMessage) {
                // Handle error messages with Banner
                setErrorContent(location.state.errorMessage);
                setErrorActive(true);

                // Reset state navigation
                navigate(location.pathname, {
                    replace: true,
                    state: null
                });
            }
        }
    }, [location.state, navigate]);

    const togglePopover = (id) => {
        setActivePopover(activePopover === id ? null : id);
    };

    const handleThemeChange = (value) => {
        setSelectedThemeId(value);
        localStorage.setItem(SELECTED_THEME_KEY, value); // Store the selected theme in local storage
    };

    const handleApplyNow = () => {
        if (selectedThemeId) {
            const editorUrl = `https://admin.shopify.com/store/storelta/themes/${selectedThemeId}/editor?context=apps`;
            window.open(editorUrl, "_blank");
        } else {
            setBannerContent('Please select a theme first.');
            setBannerActive(true);
        }
    };
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage); // Cập nhật trang hiện tại
    };
    const handleDeleteFont = async (id) => {
        try {
            await api.datafontgg.delete(id);
            const updatedFontData = fontData.filter(font => font.id !== id);
            setFontData(updatedFontData);
            if (sortedPaginatedFonts.length === 1 && currentPage > 1) { // Use sortedPaginatedFonts here
                setCurrentPage(currentPage - 1);
            }
            setToastContent('Font deleted successfully!');
            setToastActive(true);
        } catch (error) {
            console.error('Error deleting font:', error);
            setErrorContent('Failed to delete font: ' + error);
            setErrorActive(true);
        }
    }

    const handleFiltersQueryChange = (value) => setQueryValue(value);
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
    const handleFiltersClearAll = () => {
        handleQueryValueRemove();
    };


    const filteredFonts = fontData
        .filter(font =>
            font.name.toLowerCase().includes(queryValue?.toLowerCase() || "")
        )
        .sort((a, b) => {
            // Ưu tiên font đang áp dụng lên đầu
            if (a.id === currentAppliedFont) return -1;
            if (b.id === currentAppliedFont) return 1;

            // Sắp xếp theo thời gian cập nhật
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        });

    const resourceName = {
        singular: 'Font',
        plural: 'Fonts',
    };
    const totalPages = Math.ceil(filteredFonts.length / FONT_PER_PAGE); // Use filteredFonts.length for totalPages
    const sortedPaginatedFonts = filteredFonts.slice((currentPage - 1) * FONT_PER_PAGE, currentPage * FONT_PER_PAGE);


    const filters = [

    ];

    const appliedFilters = [];

    filters.forEach(({ key, label, value }) => {
        if (value) { // Check if value is truthy (not empty string, null, or undefined)
            appliedFilters.push({
                key,
                label: `${label}: ${value}`,
                onRemove: () => handleQueryValueRemove(), // For now, only query filter is implemented
            });
        }
    });

    const filterControl = (
        <Filters
            queryValue={queryValue}
            queryPlaceholder="Filter fonts"
            filters={[]}
            appliedFilters={appliedFilters}
            onQueryChange={handleFiltersQueryChange}
            onQueryClear={handleQueryValueRemove}
            onClearAll={handleFiltersClearAll}
        />
    );
    // const latestUpdatedAt = fontData.length > 0 ? Math.max(...fontData.map(font => new Date(font.updatedAt).getTime())) : 0;

    const handleApplyFont = async (font) => {
        try {
            setApplyingFontId(font.id);
            // Chỉ cập nhật thông qua selectfont
            if (!font.checkbox) throw new Error('Font has no assigned elements');

            const shop = await api.shopifyShop.findFirst({ select: { id: true } });

            if (!shop?.id) throw new Error('Could not fetch Shop ID');

            const shopid = String(shop.id);
            // Tạo giá trị cần lưu
            const value = {
                id: font.id,
                name: font.name,
                link: font.link,
                selectedElements: font.checkbox || '',
                keyfont: font.keyfont,
                keyfont: font.keyfont,
                updatedAt: new Date().toISOString() // Thêm timestamp vào value
            };

            // Tìm hoặc tạo bản ghi selectfont
            const selectfontRecords = await api.selectfont.findMany({
                filter: {
                    shopid: { equals: shopid },
                    namespace: { equals: 'setting' },
                    key: { equals: 'style' },
                },
            });

            // Cập nhật selectfont
            if (selectfontRecords.length === 0) {
                await api.selectfont.create({
                    selectfont: {
                        shopid: shopid,
                        namespace: 'setting',
                        key: 'style',
                        value: value,
                    },
                });
            } else {
                await api.selectfont.update(selectfontRecords[0].id, {
                    selectfont: {
                        value: value,
                    },
                });
            }
            // Cập nhật theme và danh sách font
            await api.update1();
            setCurrentAppliedFont(font.id);
            setToastContent('Font applied successfully!');
            setToastActive(true);

        } catch (error) {
            setErrorContent(`Failed to apply font: ${error.message}`);
            setErrorActive(true);
        } finally {
            setApplyingFontId(null);
            setActivePopover(null);
        }
    };

    return (
        <Frame>
            <Page title="Home">
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
                                videoLength={420}
                                videoProgress={420}
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

                {loading ?
                    <Layout>
                        <Layout.Section>
                            <Card>
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
                                    <Spinner size="large" accessibilityLabel="Loading" />
                                </div>
                            </Card>
                        </Layout.Section>
                    </Layout> :

                    <Layout>
                        {bannerActive && (
                            <Layout.Section>
                                <Banner title="Error" onDismiss={() => setBannerActive(false)}>
                                    <p>{bannerContent}</p>
                                </Banner>
                            </Layout.Section>
                        )}
                        {errorActive && (
                            <Layout.Section>
                                <Banner title="Error" onDismiss={() => setErrorActive(false)}>
                                    <p>{errorContent}</p>
                                </Banner>
                            </Layout.Section>
                        )}

                        {/* Section 1 */}
                        {!loading && ( // Chỉ hiện khi không loading và có dữ liệu font
                            <Layout.Section >
                                <Grid>
                                    {/* Card Google Fonts */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                        <Card padding="400" roundedAbove="sm">
                                            <BlockStack gap="200" inlineAlign="center">
                                                <Text variant="headingSm" as="h3" alignment="center">Google Fonts</Text>
                                                <Text variant="headingLg" as="p" alignment="center">{googleFontsCount}</Text>
                                            </BlockStack>
                                        </Card>
                                    </Grid.Cell>

                                    {/* Card Upload Fonts */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                        <Card padding="400" roundedAbove="sm">
                                            <BlockStack gap="200" inlineAlign="center">
                                                <Text variant="headingSm" as="h3" alignment="center">Upload Fonts</Text>
                                                <Text variant="headingLg" as="p" alignment="center">{uploadFontsCount}</Text>
                                            </BlockStack>
                                        </Card>
                                    </Grid.Cell>

                                    {/* Card Total Fonts */}
                                    <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                                        <Card padding="400" roundedAbove="sm">
                                            <BlockStack gap="200" inlineAlign="center">
                                                <Text variant="headingSm" as="h3" alignment="center">Total Fonts</Text>
                                                <Text variant="headingLg" as="p" alignment="center">{totalFontsCount}</Text>
                                            </BlockStack>
                                        </Card>
                                    </Grid.Cell>
                                </Grid>
                            </Layout.Section>
                        )}

                        {/* Section 2: Select Theme */}
                        <Layout.Section>
                            <Card>
                                <BlockStack gap="4" style={{ marginBottom: '10px' }} >
                                    <Text variant="headingMd" as="h6" >
                                        Select your theme
                                    </Text>
                                </BlockStack>
                                <BlockStack gap="200"  >
                                    <Select
                                        options={themes}
                                        onChange={handleThemeChange}
                                        value={selectedThemeId}
                                        placeholder="Select a theme"
                                    />
                                    <Text as="p" variant="bodyMd">
                                        Click on Apply now button to go to the theme editor, after that
                                        you can click on Save button to apply your fonts to the theme.
                                        Back to the app to continue your work.
                                    </Text>
                                    <ButtonGroup >
                                        <Button onClick={handleApplyNow} variant="primary" primary >
                                            Apply now
                                        </Button>
                                    </ButtonGroup>
                                </BlockStack>
                            </Card>
                        </Layout.Section>

                        {/* Section 4: Empty State or Resource List */}
                        <Layout.Section>
                            <div style={{ marginBottom: '20px' }} ref={listCardRef}>
                                {fontData && fontData.length === 0 ? (
                                    <Card >
                                        <BlockStack style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text variant="headingMd" as="h6"> Add fonts </Text>
                                        </BlockStack>
                                        <EmptyState
                                            heading="Create your first font"
                                            action={{ content: "Add new font", url: "/about" }}
                                            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                                        >
                                            <p>You can upload a custom font or select the font from Google fonts.</p>
                                        </EmptyState>
                                    </Card>
                                ) : (

                                    <Card >
                                        <BlockStack style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' , margin: '0px 8px'}}>
                                            <Text variant="headingMd" as="h6"> Add fonts </Text>
                                            <Button secondary url="/about" variant="primary">Add new font</Button>
                                        </BlockStack>
                                        <BlockStack >
                                            {filterControl} {/* Place filterControl here */}
                                            <ResourceList
                                                items={sortedPaginatedFonts}
                                                renderItem={(item) => {
                                                    const { id, name, keyfont, updatedAt, checkbox,size } = item;
                                                    // const isActive = currentAppliedFont === id || (!currentAppliedFont && new Date(updatedAt).getTime() === latestUpdatedAt);
                                                    const isActive = currentAppliedFont === id;
                                                    return (
                                                        <ResourceList.Item
                                                            id={id}
                                                            accessibilityLabel={`View details for ${name}`}
                                                            persistActions  // Giữ lại thuộc tính này để luôn hiển thị hành động
                                                        >

                                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginRight: '20px' }}>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: "flex", gap: '5px' }}>
                                                                        <Text variant="headingMd" as="h6"> Name font: </Text>
                                                                        <Text as="p" fontWeight="medium">{name}</Text>
                                                                        {
                                                                            (currentAppliedFont === id) && (
                                                                                <Badge tone="success" progress="complete">
                                                                                    Active
                                                                                </Badge>
                                                                            )
                                                                        }
                                                                    </div>

                                                                    <div style={{ display: "flex", gap: '5px' }}>
                                                                        <Text as="p" fontWeight="bold">Type:</Text>
                                                                        <Text as="p" fontWeight="medium">{keyfont}</Text>
                                                                    </div>

                                                                    <div style={{ display: "flex", gap: '5px' }}>
                                                                        <Text as="p" fontWeight="bold">Time:</Text>
                                                                        <Text as="p" fontWeight="medium">{new Date(updatedAt).toLocaleDateString() + ' ' + new Date(updatedAt).toLocaleTimeString()}</Text>
                                                                    </div>

                                                                    <div style={{ display: "flex", gap: '5px' }}>
                                                                        <Text as="p" fontWeight="bold">size:</Text>
                                                                        <Text as="p" fontWeight="medium">{size}</Text>
                                                                    </div>

                                                                    <div style={{ display: "flex", gap: '5px' }}>
                                                                        <Text as="p" fontWeight="bold">Elements:</Text>
                                                                        <Text as="p" fontWeight="medium">{checkbox}</Text>
                                                                    </div>
                                                                </div>
                                                                {/* <div style={{ marginBottom:'80px' }}> */}
                                                                <Popover
                                                                    active={activePopover === id}
                                                                    activator={
                                                                        <Button onClick={() => togglePopover(id)} icon={MenuIcon} />
                                                                    }
                                                                    onClose={() => setActivePopover(null)}
                                                                >
                                                                    <ActionList
                                                                        items={[
                                                                            // Hiển thị nút Apply chỉ khi font không active
                                                                            ...(isActive ? [] : [{
                                                                                content: applyingFontId === item.id ? (
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                        <Spinner size="small" />
                                                                                        Applying...
                                                                                    </div>
                                                                                ) : "Active",
                                                                                icon: applyingFontId === item.id ? null : CheckIcon,
                                                                                onAction: () => handleApplyFont(item),
                                                                                disabled: applyingFontId !== null
                                                                            }]),
                                                                            // Luôn hiển thị nút Update
                                                                            {
                                                                                content: "Update",
                                                                                icon: EditIcon,
                                                                                onAction: () => handleRowClick(item),
                                                                                disabled: applyingFontId !== null
                                                                            },
                                                                            // Hiển thị nút Delete chỉ khi font không active
                                                                            ...(isActive ? [] : [{
                                                                                content: "Delete",
                                                                                icon: DeleteIcon,
                                                                                onAction: () => handleDeleteFont(id),
                                                                                disabled: applyingFontId !== null
                                                                            }])
                                                                        ]}
                                                                    />
                                                                </Popover>
                                                                {/* </div> */}
                                                            </div>
                                                        </ResourceList.Item>
                                                    );
                                                }}
                                                resourceName={resourceName}
                                                pagination={{
                                                    hasNext: currentPage < totalPages,
                                                    onNext: () => handlePageChange(currentPage + 1),

                                                    hasPrevious: currentPage > 1,
                                                    onPrevious: () => handlePageChange(currentPage - 1),
                                                }}
                                            />
                                        </BlockStack>
                                    </Card>

                                )}
                            </div>
                        </Layout.Section>

                    </Layout>
                }

            </Page >
            {toastActive && (
                <Toast content={toastContent} onDismiss={() => setToastActive(false)} />
            )}
        </Frame>
    );
}