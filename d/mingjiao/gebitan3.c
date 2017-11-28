//gebitan3.c

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
	    "east" : __DIR__"gebitan2",
	    "west" : __DIR__"gebitan3",	
	    "north" : __DIR__"gebitan4",
	    "south" : __DIR__"gebitan3",  				
	]));
	set("objects",([
		__DIR__"obj/shigu" : 3,
	]));
        set("outdoor", "mingjiao");
	setup();
}

int valid_leave(object me, string dir)
{
	string dest;

	if (interactive(me) && dir == "north")
	{
		dest = __DIR__"gebitan";
		dest += "" + (string) (random(5) + 1);
		me->move(dest);
		return -1;
	}
	return ::valid_leave(me, dir);
}

