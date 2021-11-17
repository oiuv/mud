/*
5*5正方形build：
   ο   ο   ο
    ■■ ‧ ■■
    ■     ■
   ο‧  ⊙  ‧ο
    ■     ■
    ■■ ‧ ■■
   ο   ο   ο

█ - 牆
‧ - 出口
⊙ - 玩家建立build時要站立的點
ο - 檢查點，建立build時要檢查，以阻止與其它build相連
*/

#include <ansi.h>

// for area buidling
int isAreaBuilding() { return 1; }
string getAreaSize() { return "(20,20)"; }

string getCheckPointsPosition() { return "(-3,-3)"; }

// 取得檢查點 (要包含建築本身)
string *getCheckPoints()
{
    string *check =
        ({
            "1001001",
            "0111110",
            "0111110",
            "1111111",
            "0111110",
            "0111110",
            "1001001",
        });
    return check;
}

// 佔領地
string *toOccupy()
{
    string *occupy =
        ({
            "0000000",
            "0111110",
            "0111110",
            "0111110",
            "0111110",
            "0111110",
            "0000000",
        });
    return occupy;
}

// wall
string *getWall()
{
    string *wall =
        ({
            "0000000",
            "0110110",
            "0111110",
            "0011100",
            "0111110",
            "0110110",
            "0000000",
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
                0:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "┌", "─", "。", "─", "┐", getSample()}),
                2:({getSample(), "│", "  ", "  ", "  ", "│", getSample()}),
                3:({getSample(), "。", "  ", "  ", "  ", "。", getSample()}),
                4:({getSample(), "│", "  ", "  ", "  ", "│", getSample()}),
                5:({getSample(), "└", "─", "。", "─", "┘", getSample()}),
                6:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else if (type == 2)
    {
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "╔", "═", "。", "═", "╗", getSample()}),
                2:({getSample(), "║", "  ", "  ", "  ", "║", getSample()}),
                3:({getSample(), "。", "  ", "  ", "  ", "。", getSample()}),
                4:({getSample(), "║", "  ", "  ", "  ", "║", getSample()}),
                5:({getSample(), "╚", "═", "。", "═", "╝", getSample()}),
                6:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else if (type == 3)
    {
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "Ⅱ", "Ⅱ", "─", "Ⅱ", "Ⅱ", getSample()}),
                2:({getSample(), "Ⅱ", "  ", "  ", "  ", "Ⅱ", getSample()}),
                3:({getSample(), "│", "  ", "  ", "  ", "│", getSample()}),
                4:({getSample(), "Ⅱ", "  ", "  ", "  ", "Ⅱ", getSample()}),
                5:({getSample(), "Ⅱ", "Ⅱ", "─", "Ⅱ", "Ⅱ", getSample()}),
                6:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else if (type == 4)
    {
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "Ⅲ", "Ⅲ", "═", "Ⅲ", "Ⅲ", getSample()}),
                2:({getSample(), "Ⅲ", "  ", "  ", "  ", "Ⅲ", getSample()}),
                3:({getSample(), "║", "  ", "  ", "  ", "║", getSample()}),
                4:({getSample(), "Ⅲ", "  ", "  ", "  ", "Ⅲ", getSample()}),
                5:({getSample(), "Ⅲ", "Ⅲ", "═", "Ⅲ", "Ⅲ", getSample()}),
                6:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else if (type == 5)
    {
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), "█", "█", REV "▆" NOR, "█", "█", getSample()}),
                2:({getSample(), "█", "  ", "  ", "  ", "█", getSample()}),
                3:({getSample(), "▎", "  ", "  ", "  ", REV "▊" NOR, getSample()}),
                4:({getSample(), "█", "  ", "  ", "  ", "█", getSample()}),
                5:({getSample(), "█", "█", "▂", "█", "█", getSample()}),
                6:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }
    else
    { // for destruct
        style = ([
                0:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                1:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                2:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                3:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                4:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                5:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
                6:({getSample(), getSample(), getSample(), getSample(), getSample(), getSample(), getSample()}),
        ]);
    }

    return style;
}

int getTitleLength() { return 9; }

string getTitlePosition(int index)
{
    if (index == 1)
        return "(2,2)";
    else if (index == 2)
        return "(3,2)";
    else if (index == 3)
        return "(4,2)";
    else if (index == 4)
        return "(2,3)";
    else if (index == 5)
        return "(3,3)";
    else if (index == 6)
        return "(4,3)";
    else if (index == 7)
        return "(2,4)";
    else if (index == 8)
        return "(3,4)";
    else if (index == 9)
        return "(4,4)";
    else
        return 0;
}

mapping getExitPosition()
{
    mapping exits = ([
        "(9,0)" :"(3,1)",
        "(19,9)":"(5,3)",
        "(9,19)":"(3,5)",
        "(0,9)" :"(1,3)",
    ]);
    return exits;
}

string *getBuilding()
{
    string *building = ({
        "00000000000000000000",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "01111111111111111110",
        "00000000000000000000",
    });
    return building;
}

// 建好build後，會呼叫這個
// 方便設定 area 可以使用的功能
int postCondition(object build)
{
}
