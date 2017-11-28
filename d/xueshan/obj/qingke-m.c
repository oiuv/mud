// qingke-m.c 青稞面

inherit ITEM; 
inherit F_FOOD; 
 
void create() 
{ 
        set_name("青稞面", ({"qingke mian", "mian"})); 
        set_weight(200); 
        if (clonep()) 
                set_default_object(__FILE__); 
        else { 
                set("long", "一盆别有风味的青稞面。\n"); 
                set("unit", "盆"); 
                set("value", 200); 
                set("food_remaining", 4); 
                set("food_supply", 60); 
        } 
} 
