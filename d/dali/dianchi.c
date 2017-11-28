inherit ROOM;

void create()
{
	set("short", "滇池");
	set("long", @LONG
滇池四周连绵无际的山脉均属昆仑山系，云岭山脉的东支
逶迤南下，总称乌蒙山，有大小数十个山峰。湖身紧靠西山脚
下，山环水抱，天光云影，构成天然的图画。滇池的“滇”在
彝语中即是大坝子，兼司马迁的《史记·西南夷列传》中有所
记载，在古代就是这一地区的最大的部族名称，是名滇池。
LONG);
	set("outdoors", "dali");
	set("exits", ([
	    	"north"   : __DIR__"dasenlin",
	    	"south"   : __DIR__"yanchi1",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

