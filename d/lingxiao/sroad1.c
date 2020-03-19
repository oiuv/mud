inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
从这里开始，就是上凌宵城的山路了。抬头一望，雪峰高插
云霄，看不见顶，自己站立之处，仅仅是在山脚高一点，却已有
点“高处不胜寒”之感了。一路行来，虽还在山脚，却已感觉到
寒气逼人，路旁的树上，全挂满了白雪冰凌，一阵冷风吹来，已
让人缩头笼手。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"eastdown"  : __DIR__"boot",
            	"northup"  : __DIR__"sroad2",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

