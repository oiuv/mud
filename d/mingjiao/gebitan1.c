//gebitan1.c

inherit ROOM;

void create()
{
        set("short", "戈壁滩");
	set("long", @LONG
终于穿出了密林，眼前是一望无际的戈壁滩，没有路标，也没
有一个行人，天显得很高，远山披雪，苍鹰翱翔，好一派不同于中
土的异域风光。不远处，几只白骨散落地上，似乎是牦牛的尸骨？
走在这茫茫戈壁之上，你似乎迷路了。
LONG );
 	set("exits",([
		      "east" : __DIR__"westroad2",
		      "west" : __DIR__"gebitan2",	
		      "north" : __DIR__"gebitan1",
                      "south" : __DIR__"gebitan1",  				
	]));
	set("objects",([
		__DIR__"obj/shigu" : 3,
	]));
        set("outdoor", "mingjiao");
	setup();
	replace_program(ROOM);
}
