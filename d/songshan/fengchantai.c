inherit ROOM;

void create()
{
	set("short", "封禅台");
	set("long", @LONG
峻极封禅台由大麻石所建，每块大石都凿得极是平整。地
势甚为宽阔。这里独立天心，万峰在下，云开日朗，纤翳不生。
极目北望，可遥见成皋玉门，黄河有如一线，西向隐隐见到洛
阳伊阙，东南都是叠叠重山。
LONG );
	set("exits", ([
		"eastdown" : __DIR__"junjigate",
	]));
	set("outdoors", "songshan");
        set("objects", ([
                CLASS_D("songshan") + "/zuo" : 1,
        ]));    
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

