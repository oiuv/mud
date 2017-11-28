
inherit ROOM;

void create()
{
        set("short", "黑凤洞");
        set("long", @LONG
此处位於终南山脉东部的太阳山上。山峰直上直下，像刀
切般的陡峭，山腰上有一个碾盘子粗的石洞，不时冒出一股黑
气，怪可怕的。往西是一片树林。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "westup"  : __DIR__"shulin7",
        ]));

        setup();
        replace_program(ROOM);
}
