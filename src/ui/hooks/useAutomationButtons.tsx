// import { AutomationButton } from "@db/types";
// import { invoke } from "@tauri-apps/api/core";
// import { useEffect, useState } from "react";

// const useAutomationButtons=(area: string)=> {
//     const [buttons, setButtons] = useState<AutomationButton[]>([]);

//     useEffect(() => {
//         invoke("get_buttons_for_area", { area })
//             .then((data: any) => setButtons(data))
//             .catch(console.error)
//     }, [area])

//     return buttons;
// }

// export default useAutomationButtons
