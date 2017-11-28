inherit ROOM;

void create()
{
        set("short", "流云坪");
        set("long", @LONG
每逢雨霁，在后山深壑中升腾起来的云山雾海，涌过南天
门山脊向前山倾泻，直如银河飞泻，蔚为壮观，这就是南天门
的流云奇景。
LONG);
        set("exits", ([ 
               "westdown"  : __DIR__"nantian",
               "eastup"    : __DIR__"shilinfeng",
        ]));

        set("outdoors", "henshan");

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

