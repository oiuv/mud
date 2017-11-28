#include <room.h>

inherit ROOM;

void create()
{
        set("short", "红娘庄");
        set("long", @LONG
你现在正站在风光秀丽的西子湖畔的红娘庄里，临水凭窗，隔着
碧绿的湖面，就是断桥了。
LONG);
        set("exits", ([
            "west" : __DIR__"road9",
        ]) );
        set("objects", ([
                "/adm/npc/hongniang" : 1,
        ]));

        set("no_fight",1);
        setup();
        replace_program(ROOM);
}

