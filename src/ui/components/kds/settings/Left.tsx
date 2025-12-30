import ColorInput from "./ColorInput";
import SelectInput from "./SelectInput";
import ToggleInput from "./ToggleInput";

const Left = ({ settings, updateSettings, activeSection, setActiveSection }: any) => {
 
  const sections = [
    { id: 'card', label: 'Card Background' },
    { id: 'header', label: 'Header Style' },
    { id: 'items', label: 'Item Style' },
    { id: 'button', label: 'Button Style' },
    { id: 'elapsed', label: 'Elapsed Colors' },
    { id: 'display', label: 'Display Options' },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="bg-gray-50 p-4 border-b sticky top-0 z-10">
        <div className="grid grid-cols-3 gap-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-3 rounded-lg font-semibold transition-all text-sm ${
                activeSection === section.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="space-y-5">
          {activeSection === 'card' && (
            <>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-1">Card Border</h3>
                <p className="text-sm text-purple-700">Customize the overall card appearance</p>
              </div>

              <SelectInput
                label="Border Radius"
                value={settings.cardBorderRadius}
                onChange={(v: string) => updateSettings({ cardBorderRadius: v })}
                options={[
                  { value: '0px', label: 'None (Square)' },
                  { value: '4px', label: 'Small (4px)' },
                  { value: '8px', label: 'Medium (8px)' },
                  { value: '12px', label: 'Large (12px)' },
                  { value: '16px', label: 'Extra Large (16px)' },
                ]}
              />
              
              <SelectInput
                label="Card Shadow"
                value={settings.cardShadow}
                onChange={(v: string) => updateSettings({ cardShadow: v })}
                options={[
                  { value: 'none', label: 'None' },
                  { value: '0 1px 2px 0 rgb(0 0 0 / 0.05)', label: 'Small' },
                  { value: '0 4px 6px -1px rgb(0 0 0 / 0.1)', label: 'Medium' },
                  { value: '0 10px 15px -3px rgb(0 0 0 / 0.1)', label: 'Large' },
                  { value: '0 20px 25px -5px rgb(0 0 0 / 0.1)', label: 'Extra Large' },
                ]}
              />

              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded mt-6">
                <h3 className="font-bold text-purple-900 mb-1">Card Body Colors</h3>
                <p className="text-sm text-purple-700">Colors for normal and completed states</p>
              </div>
              
              <ColorInput
                label="Body Background (Normal)"
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
            </>
          )}

          {activeSection === 'header' && (
            <>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-1">Header Text Style</h3>
                <p className="text-sm text-purple-700">Customize header typography</p>
              </div>
              
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
                  { value: '14px', label: 'Small (14px)' },
                  { value: '16px', label: 'Medium (16px)' },
                  { value: '18px', label: 'Large (18px)' },
                  { value: '20px', label: 'Extra Large (20px)' },
                  { value: '24px', label: 'XXL (24px)' },
                ]}
              />
              
              <SelectInput
                label="Font Weight"
                value={settings.headerFontWeight}
                onChange={(v: string) => updateSettings({ headerFontWeight: v })}
                options={[
                  { value: '400', label: 'Normal (400)' },
                  { value: '500', label: 'Medium (500)' },
                  { value: '600', label: 'Semibold (600)' },
                  { value: '700', label: 'Bold (700)' },
                  { value: '800', label: 'Extra Bold (800)' },
                ]}
              />
            </>
          )}

          {activeSection === 'items' && (
            <>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-1">Pending Items Style</h3>
                <p className="text-sm text-purple-700">Style for items not yet completed</p>
              </div>
              
              <ColorInput
                label="Background Color"
                value={settings.itemPendingBg}
                onChange={(v: string) => updateSettings({ itemPendingBg: v })}
              />
              
              <ColorInput
                label="Border Color"
                value={settings.itemPendingBorder}
                onChange={(v: string) => updateSettings({ itemPendingBorder: v })}
              />
              
              <ColorInput
                label="Text Color"
                value={settings.itemPendingText}
                onChange={(v: string) => updateSettings({ itemPendingText: v })}
              />

              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded mt-6">
                <h3 className="font-bold text-green-900 mb-1">Completed Items Style</h3>
                <p className="text-sm text-green-700">Style for completed items</p>
              </div>
              
              <ColorInput
                label="Background Color"
                value={settings.itemCompletedBg}
                onChange={(v: string) => updateSettings({ itemCompletedBg: v })}
              />
              
              <ColorInput
                label="Border Color"
                value={settings.itemCompletedBorder}
                onChange={(v: string) => updateSettings({ itemCompletedBorder: v })}
              />
              
              <ColorInput
                label="Text Color"
                value={settings.itemCompletedText}
                onChange={(v: string) => updateSettings({ itemCompletedText: v })}
              />

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mt-6">
                <h3 className="font-bold text-blue-900 mb-1">Item Typography & Spacing</h3>
                <p className="text-sm text-blue-700">Size and spacing options</p>
              </div>
              
              <SelectInput
                label="Border Radius"
                value={settings.itemBorderRadius}
                onChange={(v: string) => updateSettings({ itemBorderRadius: v })}
                options={[
                  { value: '0px', label: 'None (Square)' },
                  { value: '4px', label: 'Small (4px)' },
                  { value: '8px', label: 'Medium (8px)' },
                  { value: '12px', label: 'Large (12px)' },
                ]}
              />
              
              <SelectInput
                label="Padding"
                value={settings.itemPadding}
                onChange={(v: string) => updateSettings({ itemPadding: v })}
                options={[
                  { value: '8px', label: 'Small (8px)' },
                  { value: '12px', label: 'Medium (12px)' },
                  { value: '16px', label: 'Large (16px)' },
                  { value: '20px', label: 'Extra Large (20px)' },
                ]}
              />
              
              <SelectInput
                label="Font Size"
                value={settings.itemFontSize}
                onChange={(v: string) => updateSettings({ itemFontSize: v })}
                options={[
                  { value: '12px', label: 'Small (12px)' },
                  { value: '14px', label: 'Medium (14px)' },
                  { value: '16px', label: 'Large (16px)' },
                  { value: '18px', label: 'Extra Large (18px)' },
                ]}
              />
              
              <SelectInput
                label="Font Weight"
                value={settings.itemFontWeight}
                onChange={(v: string) => updateSettings({ itemFontWeight: v })}
                options={[
                  { value: '400', label: 'Normal (400)' },
                  { value: '500', label: 'Medium (500)' },
                  { value: '600', label: 'Semibold (600)' },
                  { value: '700', label: 'Bold (700)' },
                ]}
              />
            </>
          )}

          {activeSection === 'button' && (
            <>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-1">Button Colors</h3>
                <p className="text-sm text-purple-700">Customize the "Mark as done" button</p>
              </div>
              
              <ColorInput
                label="Background Color"
                value={settings.buttonBgColor}
                onChange={(v: string) => updateSettings({ buttonBgColor: v })}
              />
              
              <ColorInput
                label="Text Color"
                value={settings.buttonTextColor}
                onChange={(v: string) => updateSettings({ buttonTextColor: v })}
              />
              
              <ColorInput
                label="Hover Background"
                value={settings.buttonHoverBg}
                onChange={(v: string) => updateSettings({ buttonHoverBg: v })}
              />

              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded mt-6">
                <h3 className="font-bold text-purple-900 mb-1">Button Style</h3>
                <p className="text-sm text-purple-700">Typography and spacing</p>
              </div>
              
              <SelectInput
                label="Border Radius"
                value={settings.buttonBorderRadius}
                onChange={(v: string) => updateSettings({ buttonBorderRadius: v })}
                options={[
                  { value: '0px', label: 'None (Square)' },
                  { value: '4px', label: 'Small (4px)' },
                  { value: '8px', label: 'Medium (8px)' },
                  { value: '12px', label: 'Large (12px)' },
                  { value: '9999px', label: 'Full Rounded (Pill)' },
                ]}
              />
              
              <SelectInput
                label="Font Size"
                value={settings.buttonFontSize}
                onChange={(v: string) => updateSettings({ buttonFontSize: v })}
                options={[
                  { value: '12px', label: 'Small (12px)' },
                  { value: '14px', label: 'Medium (14px)' },
                  { value: '16px', label: 'Large (16px)' },
                  { value: '18px', label: 'Extra Large (18px)' },
                ]}
              />
              
              <SelectInput
                label="Font Weight"
                value={settings.buttonFontWeight}
                onChange={(v: string) => updateSettings({ buttonFontWeight: v })}
                options={[
                  { value: '400', label: 'Normal (400)' },
                  { value: '500', label: 'Medium (500)' },
                  { value: '600', label: 'Semibold (600)' },
                  { value: '700', label: 'Bold (700)' },
                  { value: '800', label: 'Extra Bold (800)' },
                ]}
              />
              
              <SelectInput
                label="Padding"
                value={settings.buttonPadding}
                onChange={(v: string) => updateSettings({ buttonPadding: v })}
                options={[
                  { value: '8px', label: 'Small (8px)' },
                  { value: '12px', label: 'Medium (12px)' },
                  { value: '16px', label: 'Large (16px)' },
                  { value: '20px', label: 'Extra Large (20px)' },
                ]}
              />
            </>
          )}

          {activeSection === 'elapsed' && (
            <>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-1">Elapsed Time Colors</h3>
                <p className="text-sm text-purple-700">Header background changes based on time elapsed since order received</p>
              </div>
              
              <ColorInput
                label="0-5 Minutes (Fresh Orders)"
                value={settings.elapsedColor0to5}
                onChange={(v: string) => updateSettings({ elapsedColor0to5: v })}
              />
              
              <ColorInput
                label="5-10 Minutes (Getting Old)"
                value={settings.elapsedColor5to10}
                onChange={(v: string) => updateSettings({ elapsedColor5to10: v })}
              />
              
              <ColorInput
                label="10-15 Minutes (Urgent)"
                value={settings.elapsedColor10to15}
                onChange={(v: string) => updateSettings({ elapsedColor10to15: v })}
              />
              
              <ColorInput
                label="15+ Minutes (Critical)"
                value={settings.elapsedColor15plus}
                onChange={(v: string) => updateSettings({ elapsedColor15plus: v })}
              />

              <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded mt-6">
                <p className="text-sm text-orange-800">
                  <span className="font-bold">💡 Tip:</span> Use distinct colors to help kitchen staff quickly identify order priority. Warmer colors (red/orange) typically indicate urgency.
                </p>
              </div>
            </>
          )}

          {activeSection === 'display' && (
            <>
              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-1">Display Options</h3>
                <p className="text-sm text-purple-700">Control what information is shown</p>
              </div>
              
              <ToggleInput
                label="Show Admin ID"
                checked={settings.showAdminId}
                onChange={(v: boolean) => updateSettings({ showAdminId: v })}
                description="Display admin identifier on each ticket"
              />
              
              <div className="border-b border-gray-200"></div>
              
              <ToggleInput
                label="Show Preparation Time"
                checked={settings.showPreparationTime}
                onChange={(v: boolean) => updateSettings({ showPreparationTime: v })}
                description="Display estimated preparation time on tickets"
              />
              
              <div className="border-b border-gray-200"></div>
              
              <ToggleInput
                label="Auto Mark as Done"
                checked={settings.autoMarkDone}
                onChange={(v: boolean) => updateSettings({ autoMarkDone: v })}
                description="Automatically remove tickets when all items are completed (2 second delay)"
              />

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mt-6">
                <h3 className="font-bold text-blue-900 mb-1">Page Layout Settings</h3>
                <p className="text-sm text-blue-700">Customize grid and spacing</p>
              </div>

              <ColorInput
                label="Page Background Color"
                value={settings.pageBgColor}
                onChange={(v: string) => updateSettings({ pageBgColor: v })}
              />
              
              <SelectInput
                label="Grid Columns"
                value={settings.pageGridCols}
                onChange={(v: string) => updateSettings({ pageGridCols: v })}
                options={[
                  { value: '1', label: '1 Column' },
                  { value: '2', label: '2 Columns' },
                  { value: '3', label: '3 Columns' },
                  { value: '4', label: '4 Columns' },
                  { value: '5', label: '5 Columns' },
                  { value: '6', label: '6 Columns' },
                ]}
              />
              
              <SelectInput
                label="Gap Between Cards"
                value={settings.pageGap}
                onChange={(v: string) => updateSettings({ pageGap: v })}
                options={[
                  { value: '8px', label: 'Small (8px)' },
                  { value: '12px', label: 'Medium (12px)' },
                  { value: '16px', label: 'Large (16px)' },
                  { value: '20px', label: 'Extra Large (20px)' },
                  { value: '24px', label: 'XXL (24px)' },
                ]}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Left