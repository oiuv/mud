inherit ROOM;

void create()
{
        set("short", "十二莲台");
        set("long", @LONG
这里是武当绝顶的十二莲台，台与台之间以曲栏相连，雕
刻精美，是远眺的最佳所在。站立此台四眺，宛如身在千叶宝
莲之上，千峰万壑都在脚下。往西可望到七百里外的华山，东
望则汉水如练，襄、樊一带尽收眼底。
LONG);
        set("exits", ([
                "east" : __DIR__"jinding",
        ]));
        set("outdoors", "wudang");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
