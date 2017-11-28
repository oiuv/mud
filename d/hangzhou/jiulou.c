// jiulou.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "楼外楼");
        set("long", @LONG
提起“楼外楼”方圆百里无人不知。这里各式名菜是杭州一绝。
来游湖的人们都一定会来这里尝尝。整个大堂闹哄哄的挤满了各式人
等。店小儿跑来跑去，忙着招呼客人。墙上挂着价格牌子(paizi)。
LONG);
        set("exits", ([
            "west"      : __DIR__"road10",
            "up"        : __DIR__"loveroom",
        ]));
        set("objects", ([
            __DIR__"npc/xiaoer2" : 1,
        ]));
        set("item_desc", ([
            "paizi" : "
东坡肉(Pork)      ：一两白银又二十文铜板
西湖醋鱼(Fish)    ：一两白银又二十文铜板
百果油包(Baozi)   ：七十文铜板
龙井虾仁(Shrimp)  ：五十文铜板
叫化童鸡(Chicken) ：一两白银又二十文铜板
桂花鲜栗羹(Guihua geng)：一两白银又二十文铜板
酒瓶(Jiuping)     ：十六两白银\n",
        ]));
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

