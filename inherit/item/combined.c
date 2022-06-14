// combined_item.c

#include <dbase.h>
#include <name.h>

inherit F_CLEAN_UP;
inherit F_DBASE;
inherit F_MOVE;
inherit F_NAME;

nosave int amount;

void setup()
{
    if (!query("unit"))
        set("unit", "些");
}

int query_amount() { return amount; }

void destruct_me() { destruct(this_object()); }

void set_amount(int v)
{
    if (v < 0)
        error("combine:set_amount less than 1.\n");
    if (v == 0)
    {
        amount = 0;
        call_out("destruct_me", 0);
    }
    else
    {
        amount = v;
        this_object()->set_weight(v * (int)query("base_weight"));
        if (!query("money_id"))
            set("value", v * (int)query("base_value"));
    }
}

void add_amount(int v) { set_amount(amount + v); }

string short()
{
    return chinese_number(query_amount()) + query("base_unit") + ::short();
}

varargs int move(mixed dest, int silent)
{
    object env, *inv;
    int i, total;
    string file;

    if (::move(dest, silent))
    {
        env = environment();
        if (objectp(env))
        {
            file = base_name(this_object());
            if (env->is_area())
                inv = env->query_inventory(query("area_info/x_axis"), query("area_info/y_axis"));
            else
                inv = all_inventory(env);
            total = (int)query_amount();
            for (i = 0; i < sizeof(inv); i++)
            {
                if (inv[i] == this_object())
                    continue;
                if (base_name(inv[i]) == file)
                {
                    total += (int)inv[i]->query_amount();
                    destruct(inv[i]);
                }
            }
            set_amount(total);
        }
        return 1;
    }
}

// does I can combine to an item in the object env ?
int can_combine_to(object env)
{
    object item;
    string file;

    file = base_name(this_object());
    foreach (item in all_inventory(env))
        if (base_name(item) == file)
            return 1;

    return 0;
}

string type()
{
    if (this_object()->is_weapon())
        return "武器";
    if (this_object()->is_armor())
        return "防具";
    if (this_object()->is_food())
        return "食物";
    if (this_object()->is_liquid())
        return "饮具";
    if (this_object()->is_container())
        return "容器";
    if (this_object()->is_book())
        return "书物";
    if (this_object()->is_money())
        return "货币";
    if (this_object()->is_charm())
        return "护身符";
    if (this_object()->is_rune())
        return "符文";
    if (this_object()->is_inlaid())
        return "镶嵌物";
    if (this_object()->is_task())
        return "任务物品";
    return "杂物";
}
