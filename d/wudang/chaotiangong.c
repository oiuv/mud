inherit ROOM;

void create()
{
        set("short", "朝天宫");
        set("long", @LONG
这里已近武当绝顶，只见石梯直耸，危蹬高悬，两旁辅以
索链、铁拦勾连。
LONG);
        set("objects", ([
                CLASS_D("wudang") + "/qingxu": 1,
        ]));

        set("exits", ([
                "northdown" : __DIR__"hutouyan",
                "south" : __DIR__"huixianqiao",
        ]));
        set("outdoors", "wudang");
        setup();
        replace_program(ROOM);
}

