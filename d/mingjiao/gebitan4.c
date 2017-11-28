//gebitan4.c

inherit ROOM;

void create()
{
        set("short", "戈壁滩");
	set("long", @LONG
眼前是一望无际的戈壁滩，没有路标，也没有一个行人，天
显得很高，远山披雪，苍鹰翱翔，走在这茫茫戈壁之上，你似乎
迷路了。
LONG );
 	set("exits",([
	    "east" : __DIR__"gebitan4",
	    "west" : __DIR__"gebitan4",	
	    "north" : __DIR__"gebitan5",
	    "south" : __DIR__"gebitan3",  				
	]));
        set("outdoor", "mingjiao");
	setup();
	replace_program(ROOM);
}
