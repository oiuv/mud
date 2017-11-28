#include <room.h>

inherit ROOM;

void create()
{
        set("short", "习武堂");
        set("long", @LONG
这里是郭府内的习武堂，堂内一个教头在教着武功，几个
新手正在向教头学习功夫，堂子正上方挂着个匾，上面写着吃
得苦中苦，放为人上人。
LONG);
        set("no_fight", 1);
        set("exits", ([
                "south" : __DIR__"guofu_shilu-2",
        ]));
        setup();
        replace_program(ROOM);
}
