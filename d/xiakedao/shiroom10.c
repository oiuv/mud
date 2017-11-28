// /d/xiakedao/shiroom10.c 侠客岛 石室10

inherit ROOM;

void create()
{
        set("short", "石室");
        set("long", @LONG
这里却也安静。右面地上一人横卧，似是过度疲倦，已经沉沉
睡去。一个布衣男子袖手而立，呆呆地望着石壁(wall)出神他身旁
站着一位美貌少妇。旁边的火把将要燃尽，摇曳不定。地上横七竖
八丢弃了一些破损的兵刃。
LONG );
        set("exits", ([
                "north" : __DIR__"shihole3",
        ]));
        set("item_desc", ([
                "wall" : @WALL
墙的正上方刻着「脱剑膝前横」几个大字。字的下方未见图画，只是
大大小小，以各种字体写满了注释。一行草书是：杜工部诗云：一舞
剑器动四方。又一行隶书入石甚深：江南山水通志：岭南有石，瘦长
似剑传有神异，土人多膜拜。名为横另有寥寥几个蝇头小楷：戴，而
后脱之。
WALL
        ]));

        set("no_fight", 1);
        setup();
}

#include "/d/xiakedao/shiroom.h"
