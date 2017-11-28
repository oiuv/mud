inherit ROOM;

void create()
{
        set("short", "御碑亭");
        set("long", @LONG
御碑为重修南岳庙大石碑，高数丈，石碑竖立在重三万八
千斤的大石龟上，龟身雕刻细腻，极为生动。
LONG);
        set("exits", ([ 
               "south"  : __DIR__"zhengchuan",
               "north"  : __DIR__"jiayingmen",
        ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

