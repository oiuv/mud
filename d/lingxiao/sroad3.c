inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
山行崎岖，这里已是雪山之上，朔风飞扬，黄云盖天。愈上
愈高，山势也愈来愈险，俯览群山，片片浮白，在云气弥漫之下，
恍如云海中星罗棋布的岛屿。这时已是正午时分，但寒气却愈来
愈浓。四周白茫茫的一片，惟有无边飞雪，纷纷扬扬从空中撒将
下来。
LONG);
        set("outdoors", "lingxiao");
        set("exits",([
            	"southdown"  : __DIR__"sroad2",
            	"eastup"  : __DIR__"shiya",
        ]));
        set("objects", ([
                CLASS_D("lingxiao") + "/huyanwanshan" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

