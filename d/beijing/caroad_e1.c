#include <room.h>
inherit ROOM;

void create()
{
        set("short", "东长安街");
        set("long", @LONG
热闹的东长安大街是紫禁城的交通要道，宽阔的青石大道
向东西两头延伸，路边有个狗洞，几只懒狗正在那里探头。街
道上行人不断，繁华的盛世景象不言而喻。在这里可以远远望
见西边那一堵堵高大厚实的古城墙，便是著名的天安门广场了。
北面是京城最为繁华热闹的王府井大街。
LONG);
       set("exits", ([
                "east" : __DIR__"caroad_e2",
                "west" : __DIR__"cagc_e",
                "north" : __DIR__"wang_1",
        ]));
        set("objects", ([
                __DIR__"npc/girl4" : 1,
                __DIR__"npc/jumin1" : 1,
        ]));
        set("no_clean_up", 0);
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}
