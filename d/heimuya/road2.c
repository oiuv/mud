inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
你走在一条尘土飞扬的黄土路上。西南是一个小高岗，地
势险恶，客旅断绝。东面隐隐可以看到平定州城。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            	"south" : __DIR__"road1",
            	"east" : __DIR__"pingdingzhou",
        ]));
        set("objects", ([
                "/d/beijing/npc/tiaofu" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
