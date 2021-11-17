/*
3*3正方形 room build：
   ο  ο
    ⊙
   ο  ο

⊙ - 玩家建立build時要站立的點
ο - 檢查點，建立build時要檢查，以阻止與其它build相連
*/

#include <ansi.h>

// 房間型建築物
int isRoomBuilding() { return 1; }

string getName() { return "水井 (1*1) - 四方出口"; }

string getCheckPointsPosition() { return "(-1,-1)"; }

// 取得檢查點 (要包含建築本身)
string *getCheckPoints()
{
    string *check =
        ({
            "111",
            "111",
            "111",
        });
    return check;
}

// 佔領地
string *toOccupy()
{
    string *occupy =
        ({
            "000",
            "010",
            "000",
        });
    return occupy;
}

// wall
string *getWall()
{
    string *wall =
        ({
            "000",
            "000",
            "000",
        });
    return wall;
}

private string getSample()
{
    string *sample = ({"  ", GRN "〃" NOR, "  ", YEL "〃" NOR, "  ", HIG "〃" NOR});
    return sample[random(sizeof(sample))];
}

int getStyleCount() { return 1; }

mapping getStyle(int type)
{
    mapping style = ([]);

    if (type == 1)
    {
        style = ([
                0:({getSample(), getSample(), getSample()}),
                1:({getSample(), BYEL + HIB "⊙" NOR, getSample()}),
                2:({getSample(), getSample(), getSample()}),
        ]);
    }
    else
    { // for destruct
        style = ([
                0:({getSample(), getSample(), getSample()}),
                1:({getSample(), getSample(), getSample()}),
                2:({getSample(), getSample(), getSample()}),
        ]);
    }

    return style;
}

int getTitleLength() { return 0; }

string getTitlePosition(int index)
{
    return 0;
}

mapping getExitPosition()
{
    mapping exits = ([
        "north":"(1,1)",
        "east" :"(1,1)",
        "south":"(1,1)",
        "west" :"(1,1)",
    ]);
    return exits;
}

// 建好build後，將build設為具有水井功能
int postCondition(object build)
{
    build->set("_IS_WELL_", 1);
}
