import { cn } from "@/lib/utils";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/shadcn/components/ui/card";
import { useState } from "react";
import InputWithKeyboard from "../../common/InputWithKeyboard";



const options = [
  {
    id: 1,
    title: "Less",
  },
  {
    id: 2,
    title: "More",
  },
  {
    id: 3,
    title: "None",
  },
];

const Sauces = ({
  onChangeSauces,
}: {
  onChangeSauces: (value: boolean) => void;
}) => {
  const [isActive, setIsActive] = useState(1);
  const [showKeyboard, setShowKeyboard] = useState(false);
  return (
    <section
      className={cn(
        "w-full h-full flex flex-col gap-5 relative justify-between transition-all duration-300",
        showKeyboard ? "max-h-[calc(100vh-336px)]" : "max-h-screen h-full"
      )}
    >
      <div className="flex flex-col gap-5">
        <div className="w-full bg-accent-foreground p-5 flex items-center justify-center text-black">
          Sauces
        </div>
        <div className="grid grid-cols-12 w-full gap-4 px-3">
          {options.map((item) => (
            <Button
              key={item.id}
              className={cn(
                "col-span-4 h-[50px] w-full",
                isActive === item.id
                  ? "bg-primary"
                  : "bg-navigation-foreground text-black hover:text-white"
              )}
              onClick={() => {
                if (item.id !== isActive) {
                  setIsActive(item.id);
                }
              }}
            >
              {item.title}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-12 w-full gap-3 px-3">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((item) => (
            <Card
              key={item}
              className={cn(
                "rounded-xl p-2 bg-primary-foreground cursor-pointer col-span-3 py-3"
              )}
            >
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-foreground  font-medium text-sm">
                  Mayonnaise
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2 px-0">
                <p className="text-foreground  font-medium text-sm">
                  حساء ميسو
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-20 mb-4">
        <div className="px-3 flex flex-col gap-4">
          <InputWithKeyboard
            label="Order Tag Name"
            onShowKeyboard={(value) => setShowKeyboard(value)}
          />
          <InputWithKeyboard
            label="Order Tag Price"
            onShowKeyboard={(value) => setShowKeyboard(value)}
          />
        </div>
        <div className="grid grid-cols-12 gap-4 px-3 w-full">
          <Button
            className={cn(
              "col-span-4 h-[50px] bg-navigation-foreground text-foreground  hover:text-white w-full"
            )}
          >
            Add
          </Button>
          <Button
            className={cn(
              "col-span-4 h-[50px] bg-navigation-foreground text-foreground  hover:text-white w-full"
            )}
          >
            Remove
          </Button>
          <Button
            className={cn("col-span-4 h-[50px] w-full")}
            onClick={() => onChangeSauces(false)}
          >
            Save
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Sauces;
