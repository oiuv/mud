/*
3*3正方形 room build：
   ο  ο  ο
    ■ ‧ ■
   ο‧ ⊙ ‧ο
    ■ ‧ ■
   ο  ο  ο

█ - 牆
‧ - 出口
⊙ - 玩家建立build時要站立的點
ο - 檢查點，建立build時要檢查，以阻止與其它build相連
*/

#include <ansi.h>

// 房間型建築物
int isRoomBuilding() { return 1; }

string getCheckPointsPosition() { return "(-2,-2)"; }

// 取得檢查點 (要包含建築本身)
string *getCheckPoints()
{
    string *check =
        ({
            "10101",
            "01110",
            "11111",
            "01110",
            "10101",
        });
    return check;
}

// 佔領地
string *toOccupy()
{
    string *occupy =
        ({
            "00000",
            "01110",
            "01110",
            "01110",
            "00000",
        });
    return occupy;
}

// wall
string *getWall()
{
    string *wall =
        ({
            "00000",
            "01010",
            "00100",
            "01010",
            "00000",
        });
    return wall;
}

private string getSample()
{
    string *sample = ({"  ", GRN "〃" NOR, "  ", YEL "〃" NOR, "  ", HIG "〃" NOR});
    return sample[random(sizeof(sample))];
}

int getStyleCount() { return 5; }

mapping getStyle(int type)
{
    mapping style = ([]);

    if (type == 1)
    {
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "┌", "。", "┐", getSample()}),
                2:({getSample(), "。", "  ", "。", getSample()}),
                3:({getSample(), "└", "。", "┘", getSample()}),
                4:({getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else if (type == 2)
    {
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "╔", "。", "╗", getSample()}),
                2:({getSample(), "。", "  ", "。", getSample()}),
                3:({getSample(), "╚", "。", "╝", getSample()}),
                4:({getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else if (type == 3)
    {
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "Ⅱ", "─", "Ⅱ", getSample()}),
                2:({getSample(), "│", "  ", "│", getSample()}),
                3:({getSample(), "Ⅱ", "─", "Ⅱ", getSample()}),
                4:({getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else if (type == 4)
    {
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "Ⅲ", "═", "Ⅲ", getSample()}),
                2:({getSample(), "║", "  ", "║", getSample()}),
                3:({getSample(), "Ⅲ", "═", "Ⅲ", getSample()}),
                4:({getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else if (type == 5)
    {
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "█", REV "▆" NOR, "█", getSample()}),
                2:({getSample(), "▎", "  ", REV "▊" NOR, getSample()}),
                3:({getSample(), "█", "▂", "█", getSample()}),
                4:({getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else
    { // for destruct
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), getSample(), getSample(), getSample(), getSample()}),
                2:({getSample(), getSample(), getSample(), getSample(), getSample()}),
                3:({getSample(), getSample(), getSample(), getSample(), getSample()}),
                4:({getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }

    return style;
}

int getTitleLength() { return 1; }

string getTitlePosition(int index)
{
    if (index == 1)
        return "(2,2)";
    return 0;
}

mapping getExitPosition()
{
    mapping exits = ([
        "north":"(2,1)",
        "east" :"(3,2)",
        "south":"(2,3)",
        "west" :"(1,2)",
    ]);
    return exits;
}

// 建好build後，會呼叫這個
// 方便設定 area 可以使用的功能
int postCondition(object build)
{
}
