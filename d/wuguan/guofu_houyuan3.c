inherit ROOM;

void create()
{
        set("short", "后院");
        set("long", @LONG
这里是后院外了，四周都是菜地，往北是个小山坡，东西
面都是用篱笆围起的菜地，种着各样的菜，篱笆很破烂，摇摇
欲坠，看来这里没什么人打理。
LONG);
        set("no_fight", 1);
        set("exits", ([
              "west" : __DIR__"guofu_caidi2",
              "east" : __DIR__"guofu_caidi1",
              "south" : __DIR__"guofu_houyuan2",
        ]));
        set("outdoors", "wuguan");
        setup();
        replace_program(ROOM);
}
