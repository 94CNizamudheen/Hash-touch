
import ColorInput from "../ColorInput";
import SelectInput from "../SelectInput";
import ToggleInput from "../ToggleInput";
import { useState } from "react";
import Reset from "./Reset";

const MobileEditInputs = ({
    section,
    editId,
    settings,
    updateSettings,
}: any) => {
    const [resetOpen, setIsResetOpen] = useState(true)
    // CARD
    if (section === "card" && editId === "card-border") {
        return (
            <div className="space-y-4">
                <SelectInput
                    label="Border Radius"
                    value={settings.cardBorderRadius}
                    onChange={(v: string) => updateSettings({ cardBorderRadius: v })}
                    options={[
                        { value: "0px", label: "None (Square)" },
                        { value: "4px", label: "Small (4px)" },
                        { value: "8px", label: "Medium (8px)" },
                        { value: "12px", label: "Large (12px)" },
                        { value: "16px", label: "Extra Large (16px)" },
                    ]}
                />

                <SelectInput
                    label="Card Shadow"
                    value={settings.cardShadow}
                    onChange={(v: string) => updateSettings({ cardShadow: v })}
                    options={[
                        { value: "none", label: "None" },
                        {
                            value: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                            label: "Small",
                        },
                        {
                            value: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            label: "Medium",
                        },
                        {
                            value: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                            label: "Large",
                        },
                        {
                            value: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                            label: "Extra Large",
                        },
                    ]}
                />
            </div>
        );
    }

    if (section === "card" && editId === "card-body") {
        return (
            <div className="space-y-4">
                <ColorInput
                    label="Body Background"
                    value={settings.bodyBgColor}
                    onChange={(v: string) => updateSettings({ bodyBgColor: v })}
                />
                <ColorInput
                    label="Body Text Color"
                    value={settings.bodyTextColor}
                    onChange={(v: string) => updateSettings({ bodyTextColor: v })}
                />
                <ColorInput
                    label="Completed Card Background"
                    value={settings.completedCardBg}
                    onChange={(v: string) => updateSettings({ completedCardBg: v })}
                />
                <ColorInput
                    label="Completed Card Text"
                    value={settings.completedTextColor}
                    onChange={(v: string) => updateSettings({ completedTextColor: v })}
                />
            </div>
        );
    }

    if (section === "header") {
        return (
            <div className="space-y-4">
                <ColorInput
                    label="Header Text Color"
                    value={settings.headerTextColor}
                    onChange={(v: string) => updateSettings({ headerTextColor: v })}
                />
                <SelectInput
                    label="Font Size"
                    value={settings.headerFontSize}
                    onChange={(v: string) => updateSettings({ headerFontSize: v })}
                    options={[
                        { value: "14px", label: "Small (14px)" },
                        { value: "16px", label: "Medium (16px)" },
                        { value: "18px", label: "Large (18px)" },
                        { value: "20px", label: "XL (20px)" },
                        { value: "24px", label: "XXL (24px)" },
                    ]}
                />
                <SelectInput
                    label="Font Weight"
                    value={settings.headerFontWeight}
                    onChange={(v: string) => updateSettings({ headerFontWeight: v })}
                    options={[
                        { value: "400", label: "Normal (400)" },
                        { value: "500", label: "Medium (500)" },
                        { value: "600", label: "Semibold (600)" },
                        { value: "700", label: "Bold (700)" },
                        { value: "800", label: "Extra Bold (800)" },
                    ]}
                />
            </div>
        );
    }

    // ITEMS – pending / completed / typography
    if (section === "items" && editId === "items-pending") {
        return (
            <div className="space-y-4">
                <ColorInput
                    label="Pending Background"
                    value={settings.itemPendingBg}
                    onChange={(v: string) => updateSettings({ itemPendingBg: v })}
                />
                <ColorInput
                    label="Pending Border"
                    value={settings.itemPendingBorder}
                    onChange={(v: string) => updateSettings({ itemPendingBorder: v })}
                />
                <ColorInput
                    label="Pending Text"
                    value={settings.itemPendingText}
                    onChange={(v: string) => updateSettings({ itemPendingText: v })}
                />
            </div>
        );
    }

    if (section === "items" && editId === "items-completed") {
        return (
            <div className="space-y-4">
                <ColorInput
                    label="Completed Background"
                    value={settings.itemCompletedBg}
                    onChange={(v: string) => updateSettings({ itemCompletedBg: v })}
                />
                <ColorInput
                    label="Completed Border"
                    value={settings.itemCompletedBorder}
                    onChange={(v: string) =>
                        updateSettings({ itemCompletedBorder: v })
                    }
                />
                <ColorInput
                    label="Completed Text"
                    value={settings.itemCompletedText}
                    onChange={(v: string) =>
                        updateSettings({ itemCompletedText: v })
                    }
                />
            </div>
        );
    }

    if (section === "items" && editId === "items-typo") {
        return (
            <div className="space-y-4">
                <SelectInput
                    label="Item Border Radius"
                    value={settings.itemBorderRadius}
                    onChange={(v: string) => updateSettings({ itemBorderRadius: v })}
                    options={[
                        { value: "0px", label: "None" },
                        { value: "4px", label: "Small" },
                        { value: "8px", label: "Medium" },
                        { value: "12px", label: "Large" },
                    ]}
                />
                <SelectInput
                    label="Item Padding"
                    value={settings.itemPadding}
                    onChange={(v: string) => updateSettings({ itemPadding: v })}
                    options={[
                        { value: "8px", label: "Small (8px)" },
                        { value: "12px", label: "Medium (12px)" },
                        { value: "16px", label: "Large (16px)" },
                        { value: "20px", label: "XL (20px)" },
                    ]}
                />
                <SelectInput
                    label="Item Font Size"
                    value={settings.itemFontSize}
                    onChange={(v: string) => updateSettings({ itemFontSize: v })}
                    options={[
                        { value: "12px", label: "Small (12px)" },
                        { value: "14px", label: "Medium (14px)" },
                        { value: "16px", label: "Large (16px)" },
                        { value: "18px", label: "XL (18px)" },
                    ]}
                />
                <SelectInput
                    label="Item Font Weight"
                    value={settings.itemFontWeight}
                    onChange={(v: string) => updateSettings({ itemFontWeight: v })}
                    options={[
                        { value: "400", label: "Normal" },
                        { value: "500", label: "Medium" },
                        { value: "600", label: "Semibold" },
                        { value: "700", label: "Bold" },
                    ]}
                />
            </div>
        );
    }

    // BUTTON
    if (section === "button" && editId === "button-colors") {
        return (
            <div className="space-y-4">
                <ColorInput
                    label="Button Background"
                    value={settings.buttonBgColor}
                    onChange={(v: string) => updateSettings({ buttonBgColor: v })}
                />
                <ColorInput
                    label="Button Text"
                    value={settings.buttonTextColor}
                    onChange={(v: string) => updateSettings({ buttonTextColor: v })}
                />
                <ColorInput
                    label="Button Hover Background"
                    value={settings.buttonHoverBg}
                    onChange={(v: string) => updateSettings({ buttonHoverBg: v })}
                />
            </div>
        );
    }

    if (section === "button" && editId === "button-style") {
        return (
            <div className="space-y-4">
                <SelectInput
                    label="Border Radius"
                    value={settings.buttonBorderRadius}
                    onChange={(v: string) => updateSettings({ buttonBorderRadius: v })}
                    options={[
                        { value: "0px", label: "Square" },
                        { value: "4px", label: "Small" },
                        { value: "8px", label: "Medium" },
                        { value: "12px", label: "Large" },
                        { value: "9999px", label: "Pill" },
                    ]}
                />
                <SelectInput
                    label="Font Size"
                    value={settings.buttonFontSize}
                    onChange={(v: string) => updateSettings({ buttonFontSize: v })}
                    options={[
                        { value: "12px", label: "Small" },
                        { value: "14px", label: "Medium" },
                        { value: "16px", label: "Large" },
                        { value: "18px", label: "XL" },
                    ]}
                />
                <SelectInput
                    label="Font Weight"
                    value={settings.buttonFontWeight}
                    onChange={(v: string) => updateSettings({ buttonFontWeight: v })}
                    options={[
                        { value: "400", label: "Normal" },
                        { value: "500", label: "Medium" },
                        { value: "600", label: "Semibold" },
                        { value: "700", label: "Bold" },
                        { value: "800", label: "Extra Bold" },
                    ]}
                />
                <SelectInput
                    label="Vertical Padding"
                    value={settings.buttonPadding}
                    onChange={(v: string) => updateSettings({ buttonPadding: v })}
                    options={[
                        { value: "8px", label: "Small" },
                        { value: "12px", label: "Medium" },
                        { value: "16px", label: "Large" },
                        { value: "20px", label: "XL" },
                    ]}
                />
            </div>
        );
    }

    // ELAPSED
    if (section === "elapsed") {
        return (
            <div className="space-y-4">
                <ColorInput
                    label="0–5 min"
                    value={settings.elapsedColor0to5}
                    onChange={(v: string) => updateSettings({ elapsedColor0to5: v })}
                />
                <ColorInput
                    label="5–10 min"
                    value={settings.elapsedColor5to10}
                    onChange={(v: string) => updateSettings({ elapsedColor5to10: v })}
                />
                <ColorInput
                    label="10–15 min"
                    value={settings.elapsedColor10to15}
                    onChange={(v: string) => updateSettings({ elapsedColor10to15: v })}
                />
                <ColorInput
                    label="15+ min"
                    value={settings.elapsedColor15plus}
                    onChange={(v: string) => updateSettings({ elapsedColor15plus: v })}
                />
            </div>
        );
    }

    // DISPLAY
    if (section === "display" && editId === "display-options") {
        return (
            <div className="space-y-3">
                <ToggleInput
                    label="Show Admin ID"
                    checked={settings.showAdminId}
                    onChange={(v: boolean) => updateSettings({ showAdminId: v })}
                    description="Display admin identifier on each ticket"
                />
                <ToggleInput
                    label="Show Preparation Time"
                    checked={settings.showPreparationTime}
                    onChange={(v: boolean) =>
                        updateSettings({ showPreparationTime: v })
                    }
                    description="Show estimated prep time"
                />
                <ToggleInput
                    label="Auto Mark as Done"
                    checked={settings.autoMarkDone}
                    onChange={(v: boolean) => updateSettings({ autoMarkDone: v })}
                    description="Remove tickets automatically when all items are completed"
                />
            </div>
        );
    }

    if (section === "display" && editId === "display-layout") {
        return (
            <div className="space-y-4">
                <ColorInput
                    label="Page Background"
                    value={settings.pageBgColor}
                    onChange={(v: string) => updateSettings({ pageBgColor: v })}
                />
                <SelectInput
                    label="Grid Columns"
                    value={settings.pageGridCols}
                    onChange={(v: string) => updateSettings({ pageGridCols: v })}
                    options={[
                        { value: "1", label: "1 column" },
                        { value: "2", label: "2 columns" },
                        { value: "3", label: "3 columns" },
                        { value: "4", label: "4 columns" },
                    ]}
                />
                <SelectInput
                    label="Gap Between Cards"
                    value={settings.pageGap}
                    onChange={(v: string) => updateSettings({ pageGap: v })}
                    options={[
                        { value: "8px", label: "Small (8px)" },
                        { value: "12px", label: "Medium (12px)" },
                        { value: "16px", label: "Large (16px)" },
                        { value: "20px", label: "XL (20px)" },
                    ]}
                />
            </div>
        );
    }
    if (section === "device" && resetOpen) {
        return <Reset
        editId={editId}
        onCancel={()=>setIsResetOpen(false)}
        />
    }

    return null;
};

export default MobileEditInputs;
