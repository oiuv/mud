// shidong9.c 石洞

inherit ROOM;

void create()
{
        set("short", "石洞");
        set("long", @LONG
这是一个很小的石洞，两边点着红烛，光线虽暗，却也能辩得
出方向。走着走着，你隐约看见在前面有一个身影，只见他身穿青
色长衫，眼视前方，一副唯我独尊的样子。
LONG );
        set("exits", ([
                "west" : __DIR__"shidong10",
                "east" : __DIR__"yadi",
        ]));

        setup();
        replace_program(ROOM);
}
