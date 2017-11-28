#include <ansi.h>

inherit __DIR__"tattoo";

void create()
{
        set_name(NOR + WHT "九宵纹龍图" NOR, ({ "wenlong tu", "wenlong", "tu" }));
        set_weight(300);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张古旧的图片，上面绘着些纹样。");
                set("unit", "张");
                set("value", 16500);
                set("material", "paper");
                set("tattoo_long", "九条蛟龍，相互盘绕缠缚，栩栩如生");
                set("can_tattoo", ({ "胸口", "后背", }));
                set("tattoo_type", ({ "膂力" }));
                set("tattoo_str", 4);
                set("tattoo_special", "power");
                set("tattoo_spcname", "天神降世");
        }
}
