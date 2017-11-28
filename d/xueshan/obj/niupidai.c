// niupidai.c 牛皮袋

inherit ITEM;
inherit F_LIQUID;

void create()
{
        set_name("牛皮袋", ({"niu pidai", "pidai","dai","skin" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是用来装酥油茶的牛皮袋，散发出淡淡的乳香。\n");
                set("unit", "个");
                set("value", 150);
                set("max_liquid", 10);
        } 
 
        set("liquid", ([ 
                "type": "suyou cha", 
                "name": "酥油茶", 
                "remaining": 10, 
                "drunk_supply": 20, 
        ])); 

}
