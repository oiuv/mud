inherit ROOM;

void create()
{
        set("short", "崎岖山路");
        set("long", @LONG
你走在一条崎岖狭隘的山路上，一边是峭壁，一边是悬崖。
高高的天柱峰笼罩在云雾中，隐约可见。可是身旁的进香客和
游人都仔细地町着自己的脚下，不敢抬头望一眼，惟恐一不小
心摔下去。更有强人趁机打劫，行人无不噤声闭气，只求快点
赶路。
LONG);
        set("outdoors", "wudang");
        set("exits", ([
                "northup" : __DIR__"tyroad6",
                "eastdown" : __DIR__"tyroad8",
        ]));
        set("no_clean_up", 0);
        setup();
}
