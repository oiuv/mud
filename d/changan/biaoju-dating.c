//Room: biaoju-dating.c

inherit ROOM;

void create()
{
        set("short", "河洛镖局大厅");
        set("long", @LONG
厅堂中的陈设，全是十分精致的紫檀木家具，单是那扇巨大的八摺
屏风，上面镶了各色宝玉，砌成极其生动的八仙图，已是罕见的古物。
上首一虎皮交椅，上面坐着一个相貌威猛的汉子。
LONG);
        set("exits", ([
        	"north" : __DIR__"biaoju-dayuan",
        ]));
        set("objects", ([
        	__DIR__"npc/zong-biaotou" : 1,
        ]) );

        setup();
        replace_program(ROOM);
}
