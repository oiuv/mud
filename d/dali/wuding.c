inherit ROOM;

void create()
{
	set("short", "武定镇");
	set("long", @LONG
这里是台夷分支卢鹿族罗蝥部的治府，罗蝥部除了这武定州外还
辖元谋、禄定两镇。此镇不大，正处山中竹林深处，显得格外清幽。
卢鹿族人的竹楼四散分布在竹林中。
LONG);
	set("outdoors", "dali");
	set("exits", ([
                "north"     : __DIR__"zhulou1",
                "northeast" : __DIR__"zhulin",
                "west"      : __DIR__"qingzhulin",
                "south"     : __DIR__"nongtian1",
	]));
        set("objects", ([
                __DIR__"npc/guniang": 1,
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

