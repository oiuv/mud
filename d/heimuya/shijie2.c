inherit ROOM;

void create()
{
        set("short", "石阶");
        set("long", @LONG
行进至此，山路突然陡峭，两旁山峰笔立，中间留出一条
窄窄的石阶，仅能容下两人并肩而行。从这里往上望，隐约望
见一座石门。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            	"eastdown" : __DIR__"shijie1",
            	"westup"   : __DIR__"shimen",
        ]));
        set("objects", ([
                CLASS_D("riyue") + "/fan" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
