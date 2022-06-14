// room16_s_r.c
// 房間型式, 有16格, 出口為south

#include <ansi.h>

int isAreaPattern() { return 1; }

string getName() { return "房子[16格], 出口[南], 藍底外框顏色隨機 "; }

private string getRandomColor()
{
    string *sample = ({
        BBLU+HIK,
        BBLU+HIW,
        BBLU+HIR,
        BBLU+HIG,
        BBLU+HIB,
        BBLU+HIM,
        BBLU+HIC,
        BBLU+HIY,
    });
    return sample[random(sizeof(sample))];
}


// icon樣子
private mapping getIcon()
{
    string color = getRandomColor();
    mapping icon = ([
        0: ({ color +"╔="NOR, color +"=="NOR, color +"=="NOR, color +"=╗"NOR }),
        1: ({ color +"║ "NOR, color +"  "NOR, color +"  "NOR, color +" ║"NOR }),
        2: ({ color +"║ "NOR, color +"  "NOR, color +"  "NOR, color +" ║"NOR }),
        3: ({ color +"╚="NOR, color +"= "NOR, color +" ="NOR, color +"=╝"NOR }),
    ]);

    return icon;
}

// block設定
private mapping getBlock()
{
    mapping block = ([
        0: ({1, 1, 1, 1}),
        1: ({1, 0, 0, 1}),
        2: ({1, 0, 0, 1}),
        3: ({1, 0, 0, 1}),
    ]);

    return block;
}

mapping getMapStyle()
{
    mapping style = ([
        "icon": getIcon(),
        "block": getBlock(),
    ]);

    return style;
}
