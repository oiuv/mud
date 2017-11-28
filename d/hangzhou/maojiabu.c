#include <room.h>
inherit ROOM;

void create()
{
        set("short", "茅家埠");
        set("long", @LONG
路两旁盖着几座小土房。房门口一位老大娘正在喂鸡，几
个小孩正在追逐嬉戏。北边是上黄泥岭。南面是丁家山。
LONG);
        set("exits", ([
            	"south"   : __DIR__"tulu2",
            	"northup"     : __DIR__"huangniling",
        ]));
        set("objects", ([
            	__DIR__"npc/boy" : 1,
            	__DIR__"npc/oldwoman" : 1,
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
