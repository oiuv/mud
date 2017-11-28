inherit ROOM;

void create()
{
        set("short", "金顶");
        set("long", @LONG
你感到寒意阵阵袭来，原来你已到了武当山的主峰天柱峰
的绝顶。前面的金殿由铜铸成，镀以黄金，每当旭日临空，整
个殿宇金光闪闪，故名金顶。天柱峰高高独立于群峰上，东西
壁立二山，名叫蜡烛峰，中壁一山似香炉名香炉峰，万山千壑
隐隐下伏。
LONG);
        set("exits", ([
                "northdown": __DIR__"santiangate",
                "south"    : __DIR__"zijincheng",
                "west"     : __DIR__"shierliantai",
        ]));
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
