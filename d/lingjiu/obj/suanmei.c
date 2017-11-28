// suanmei.c À·√∑Ã¿
inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name("À·√∑Ã¿", ({ "suanmei tang","tang" }));
        set_weight(1000);
        if( clonep() )
          set_default_object(__FILE__);
        else {
        set("long",
            "’‚ «“ªÕÎΩ‚ø ¡ºÃ¿°£!\n");
        set("unit", "ÕÎ");
        set("value", 20);
        set("max_liquid", 10);
        }
        set("liquid", ([
            "name" : "À·√∑Ã¿",
            "remaining" : 8,
       	    "type" : "water"
        ]) );
        set("liquid_type", "water");
        setup();
}

