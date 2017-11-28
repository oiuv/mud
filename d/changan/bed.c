//Room: bed.c

inherit ROOM;

void create()
{
        set("short", "床上");
        set("long", @LONG
一张白色的软榻，看上去极为精致，纱衾鸳枕之间散发出一丝丝幽香．
LONG);
        set("exits", ([
        	"out": __DIR__"kzsleep",
        ]));
        set("no_fight", 1);
       	//set("no_magic", 1);
        set("sleep_room",1);
        set("if_bed",1);

        setup();
        replace_program(ROOM);
}

