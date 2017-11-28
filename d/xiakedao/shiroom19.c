// /d/xiakedao/shiroom19.c 侠客岛 石室19

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
这里极为低矮，身材稍高之人便要低头。室内仅余西北角一支火
把，其余的均已燃为灰烬，在昏暗的光线中，仅有一人盘膝而坐，对
照石壁(wall)比划着。只见掌指交替，繁杂无比。
LONG );
        set("exits", ([
                "west"  : __DIR__"shihole5",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「千秋二壮士」几个大字。下方绘出侯嬴与朱亥二人
携手而行，正是古风“侠客行”原意。侧面一行小楷：子曰：知者乐
水，仁者乐山。知者动，仁者静。又注：庄子秋水篇：不知何时止而
不盈，尾闾泻之。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
