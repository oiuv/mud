// compile_object: This is used for loading MudOS "virtual" objects.
// It should return the object the mudlib wishes to associate with the
// filename named by 'file'.  It should return 0 if no object is to be
// associated.
/**
 * @brief 虚拟对象处理方法
 *
 * @param str
 * @return mixed
 */
mixed compile_object(string str)
{
    // debug_message("[CORE_MASTER_OB]->compile_object():" + str);
    return call_other(VIRTUAL_D, "compile_object", str);
}

/**
 * @brief 在printf()/sprintf()中返回对象的名称
 *
 * @param ob
 * @return string
 */
string object_name(object ob)
{
    // debug_message("[CORE_MASTER_OB]->object_name():" + file_name(ob));
    if (ob && function_exists("query", ob, 1))
        return ob->short();
}
