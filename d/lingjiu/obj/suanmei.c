// suanmei.c 酸梅汤
inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name("酸梅汤", ({ "suanmei tang","tang" }));
        set_weight(1000);
        if( clonep() )
          set_default_object(__FILE__);
        else {
        set("long",
            "这是一碗解渴良汤。!\n");
        set("unit", "碗");
        set("value", 20);
        set("max_liquid", 10);
        }
        set("liquid", ([
            "name" : "酸梅汤",
            "remaining" : 8,
               "type" : "water"
        ]) );
        set("liquid_type", "water");
        setup();
}
