// /d/xiakedao/shiroom06.c 侠客岛 石室6

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
这间石室中却恰巧无人观看图谱，端的是冷冷清清，隔壁传来隐
隐的喧嚣。墙上火把静静地燃烧着，偶尔发出轻微的毕驳之声，空中
有阵阵松脂的气味，石壁(wall)也被熏黑了几处。
LONG );
        set("exits", ([
                "north" : __DIR__"shihole2",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「千里不留行」几个大字。字的下方刻有图案，乃是
一条普通的驿道。远处一架马车若隐若现，道上烟尘四起，渐渐地与
空中的云雾交织成一片。旁边的注解甚多，一时也辨认不清。
WALL
        ]));

        set("no_fight", 1);
        setup();

}

#include "/d/xiakedao/shiroom.h"
