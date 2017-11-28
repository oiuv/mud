#include <ansi.h>
#include <room.h>

inherit ROOM;

void create()
{
        set("short", "广场");
        set("long",@long
这里是一个平平开阔的大广场，广场上有昆仑派的弟子在
习武，前面不远处是一个巨大的石屏风，后面就是昆仑派的前
厅了，西面和东面仍然是广场。
long);
        set("exits",([
                "north" : __DIR__"shanlu04",
                "south" : __DIR__"pingfeng",
                "west" : __DIR__"guangchangw",
                "east" : __DIR__"guangchange",
        ]));

        set("objects",([
                CLASS_D("kunlun") + "/gaozecheng" : 1,
                __DIR__"npc/kl-dizi2" :  2,
        ]));
        set("outdoors", "kunlun");
        setup();
        replace_program(ROOM);
}
