// green9_r_01.c
// 草地, 九格, 隨機

#include <ansi.h>

int isAreaPattern() { return 1; }

string getName() { return "草地[9格], 樣式隨機 "; }

private string getSample()
{
    string *sample = ({ "  ", GRN"〃"NOR, "  ", YEL"〃"NOR, "  ", HIG"〃"NOR });
    return sample[random(sizeof(sample))];
}

// icon樣子
private mapping getIcon()
{
    mapping icon = ([
        0: ({ getSample(), getSample(), getSample() }),
        1: ({ getSample(), getSample(), getSample() }),
        2: ({ getSample(), getSample(), getSample() }),
    ]);

    return icon;
}

mapping getMapStyle()
{
    mapping style = ([
        "icon": getIcon(),
    ]);

    return style;
}
