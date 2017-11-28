inherit ROOM;

void create()
{
        set("short", "石阶");
        set("long", @LONG
行进至此，山路突然陡峭，两旁山峰笔立，中间留出一条
窄窄的石阶，仅能两人并肩而行。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            	"eastdown" : __DIR__"shandao2",
            	"westup"   : __DIR__"shijie2",
        ]));
        set("objects", ([
                CLASS_D("riyue") + "/yun" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
