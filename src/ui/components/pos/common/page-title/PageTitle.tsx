
import { useTranslation } from "react-i18next";

type PageTitleProps = {
  title: string;
};

const PageTitle = ({ title }: PageTitleProps) => {
  const { t } = useTranslation();

  // Date formatting
  // const date = new Date();
  // const formattedDate = date.toLocaleDateString("en-GB", {
  //   weekday: "long",
  //   year: "numeric",
  //   month: "short",
  //   day: "numeric",
  // });

  return (
    <div className="w-full min-h-16 border-b border-border bg-background px-6 py-4 flex items-center justify-between">
      
      {/* LEFT: TITLE + DATE */}
      <div className="flex flex-col">
        <h2 className="font-bold text-2xl text-foreground">{t(title)}</h2>
        {/* <p className="text-muted-foreground text-sm mt-1">{formattedDate}</p> */}
      </div>
    </div>
  );
};

export default PageTitle;
