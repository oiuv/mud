// room9_s_r.c
// 房間型式, 有9格, 出口為south

#include <ansi.h>

int isAreaPattern() { return 1; }

string getName() { return "房子[9格], 出口[南], 藍底灰白框 "; }

// icon樣子
private mapping getIcon()
{
    string color = BBLU+HIK;
    mapping icon = ([
        0: ({ color +"╔"NOR, color +"═"NOR, color +"╗"NOR }),
        1: ({ color +"║"NOR, color +"  "NOR, color +"║"NOR }),
        2: ({ color +"╚"NOR, color +"。"NOR, color +"╝"NOR }),
    ]);

    return icon;
}

// block設定
private mapping getBlock()
{
    mapping block = ([
        0: ({1, 1, 1}),
        1: ({1, 0, 1}),
        2: ({1, 0, 1}),
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
