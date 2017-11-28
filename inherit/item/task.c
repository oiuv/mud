inherit ITEM;

int is_task() { return 1; }
varargs int move(mixed dest, int raw)
{
        object ob;

        if (::move(dest, raw)) 
        {
                ob = environment();
                if (objectp(ob) && ! this_object()->query("geter") && userp(ob)) 
                        this_object()->set("geter", ob->name(1));
                return 1;
        }    
}

/*
string extra_long()
{
        string str;
        
        str =  "\n物品类型 : 任务物品\n";
        str += sprintf("攻    击 : %d\n", query("weapon_prop/damage"));
        str += sprintf("重    量 : %d\n", this_object()->query_weight());
        str += sprintf("杀    戮 : %d\n", query("combat/PKS"));
        // str += sprintf("使用方式 : 输入指令 wield %s 装备。\n", query("id"));
        str += sprintf("                  输入指令 unwield %s 卸下。\n", query("id"));
        if (this_object()->query_autoload())
                str += "下线丢失 : 否\n";
        else
                str += "下线丢失 : 是\n";
        return str;
}
*/
