inherit ROOM;

void create()
{
	set("short","府河桥");
	set("long",@LONG
这里是成都北门外府河桥。成都虽是川中首府，却无险可
守，一旦敌方兵至成都平原，即使府南两河水涨，也就只有祷
告对方慈悲的选择了。
LONG);
	set("outdoors", "chengdu");
	set("exits", ([
            	"north"  : "/d/qingcheng/qcroad1",
            	"south"  : __DIR__"northgate",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

