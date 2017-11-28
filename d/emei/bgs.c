#include <ansi.h>
inherit ROOM;

string look_ta();

void create()
{
        set("short", "报国寺");
        set("long", @LONG
报国寺是峨眉山最的大寺院之一。寺庙倚山建造，弥勒殿
大雄殿、七佛殿逐级升高，规模宏大。殿内佛像金光闪闪气宇
轩昂。寺内芳草迷径，花开不绝。这里有座华严塔(ta)。这里
向西，约二里可达伏虎寺。
LONG);
        set("outdoors", "emei");
        set("item_desc", ([
                "ta" : (: look_ta :),
        ]));
        set("objects", ([
                __DIR__"npc/guest": 1,
        ]));
        set("exits", ([
                "west"  : __DIR__"bgsxq",
                "enter" : __DIR__"dxdian",
                "north" : __DIR__"bgsgate",
                "south" : __DIR__"milin1",
        ]));
        setup();
        //replace_program(ROOM);
}

string look_ta()
{
        return YEL "\n这是一座十五层的紫铜铸华严塔。塔高七"
               "米，塔身周匝共有小\n佛四千七百尊之多，并铸"
               "有「华严经」全文两万多字，其冶炼\n工艺与雕"
               "工技巧，已造至极至美之境。\n\n" NOR;
}
