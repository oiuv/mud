// hupan.c
inherit ROOM;

void create()
{
        set("short", "南湖湖畔");
        set("long", @LONG
顺着南湖一直走过去，你欣赏着湖边的杨柳，不知不觉地已经走
到南湖的尽头，这里有一条蜿蜒的小路向前延伸着，隐隐约约可以看
到一座庄园，你不禁想走过去看看那里是什么地方．
LONG
        );
        set("exits", ([ /* sizeof() == 2 */
  "west" : "/d/quanzhou/nanhu1",
  "north" : __DIR__"xiaolu.c",
]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

